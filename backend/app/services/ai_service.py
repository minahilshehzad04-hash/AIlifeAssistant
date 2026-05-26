from app.models.schemas import ChatRequest, AnalyzeRequest, IngestRequest, PlanRequest, DailyPlan
from supabase import create_client, Client
from app.core.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
import json


class AssistantResponse(BaseModel):
    conversational_reply: str
    extracted_tasks: list[str]
    extracted_reminders: list[str]


class AIService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )

    def _embed(self, text: str) -> list[float]:
        return self.embeddings.embed_query(text)

    def _python_hybrid_search_fallback(self, user_id: str, query: str, query_vector: list[float], k: int = 8) -> list:
        """
        Pure Python fallback for the hybrid search when the database stored procedure is missing.
        """
        try:
            # 1. Fetch all memory embeddings for the user
            result = self.supabase.table("memory_embeddings").select("*").eq("user_id", user_id).execute()
            if not result.data:
                return []
            
            # Helper for cosine similarity
            import math
            def cosine_similarity(v1, v2):
                dot_product = sum(x * y for x, y in zip(v1, v2))
                magnitude1 = math.sqrt(sum(x * x for x in v1))
                magnitude2 = math.sqrt(sum(x * x for x in v2))
                if magnitude1 == 0 or magnitude2 == 0:
                    return 0.0
                return dot_product / (magnitude1 * magnitude2)
            
            # 2. Score each memory
            scored_memories = []
            query_words = set(query.lower().split())
            
            for row in result.data:
                # Parse embedding
                row_emb = row.get("embedding")
                if isinstance(row_emb, str):
                    try:
                        row_emb = json.loads(row_emb)
                    except:
                        if row_emb.startswith('[') and row_emb.endswith(']'):
                            row_emb = [float(x) for x in row_emb[1:-1].split(',')]
                        else:
                            row_emb = None
                
                sim_score = 0.0
                if row_emb and isinstance(row_emb, list):
                    sim_score = cosine_similarity(query_vector, row_emb)
                
                # Keyword matching score
                content = row.get("content", "")
                content_words = set(content.lower().split())
                word_intersection = query_words.intersection(content_words)
                
                keyword_score = 0.0
                if query_words:
                    keyword_score = len(word_intersection) / len(query_words)
                
                # Combine scores (70% semantic similarity + 30% exact keyword match)
                combined_score = sim_score * 0.7 + keyword_score * 0.3
                
                scored_memories.append((combined_score, row))
            
            # 3. Sort and pick top k
            scored_memories.sort(key=lambda x: x[0], reverse=True)
            return [item[1] for item in scored_memories[:k]]
        except Exception as fallback_err:
            print(f"Python Fallback Search Error: {fallback_err}")
            return []

    def _hybrid_search(self, user_id: str, query: str, k: int = 8) -> str:
        """
        Performs Hybrid Search:
        1. Vector Similarity (Meaning)
        2. Keyword Search (Exact words)
        3. Recency Boost (Newer is better)
        """
        try:
            query_vector = self._embed(query)
            rows = []
            try:
                result = self.supabase.rpc(
                    "hybrid_search",
                    {
                        "query_text": query,
                        "query_embedding": query_vector,
                        "user_id_filter": user_id,
                        "match_count": k
                    }
                ).execute()
                rows = result.data or []
            except Exception as e:
                print(f"Hybrid Search RPC failed, using Python fallback. Error: {e}")
                rows = self._python_hybrid_search_fallback(user_id, query, query_vector, k)
            
            if rows:
                # Format memories with their metadata for better AI understanding
                memories = []
                for row in rows:
                    metadata = row.get("metadata") or {}
                    mtype = metadata.get("source_type", "memory")
                    memories.append(f"[{mtype.upper()}]: {row['content']}")
                
                # Memory Summarization logic: If we have too many memories, summarize them
                if len(memories) > 4:
                    return self._summarize_memories(memories)
                
                return "\n".join(memories)
        except Exception as e:
            print(f"Hybrid Search Error: {e}")
        return "No prior context available."


    def _summarize_memories(self, memories: list[str]) -> str:
        """Condenses multiple memories into a concise summary to save context space."""
        try:
            summary_prompt = ChatPromptTemplate.from_messages([
                ("system", "Summarize the following memories into a few concise bullet points, focusing on the most relevant facts and dates."),
                ("user", "{memories}")
            ])
            chain = summary_prompt | self.llm | StrOutputParser()
            return chain.invoke({"memories": "\n".join(memories)})
        except:
            return "\n".join(memories[:4]) # Fallback to first 4

    async def ingest_memory(self, request: IngestRequest):
        try:
            vector = self._embed(request.text_content)
            self.supabase.table("memory_embeddings").insert({
                "user_id": request.user_id,
                "content": request.text_content,
                "metadata": {
                    "source_type": request.source_type,
                    "source_id": request.source_id,
                    "user_id": request.user_id
                },
                "embedding": vector
            }).execute()
            return {"status": "success"}
        except Exception as e:
            print(f"Ingest Error: {e}")
            raise Exception(f"Failed to ingest: {str(e)}")

    async def generate_chat_response(self, request: ChatRequest) -> dict:
        try:
            # 1. Fetch live tasks (Always priority)
            tasks_res = self.supabase.table('tasks').select('title, status').eq('user_id', request.user_id).eq('status', 'pending').execute()
            live_tasks = json.dumps(tasks_res.data) if tasks_res.data else "No pending tasks."

            # 2. Advanced Hybrid RAG Search
            rag_context = self._hybrid_search(request.user_id, request.message)

            context_text = f"--- CURRENT PENDING TASKS ---\n{live_tasks}\n\n--- RELEVANT PAST MEMORIES ---\n{rag_context}"

            # 3. Intelligent Prompting
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an elite Life Admin Assistant. 
                You have access to the user's LIVE tasks and their PAST memories (retrieved via hybrid search).
                
                Guidelines:
                1. If the user asks about the past, prioritize the 'PAST MEMORIES' section.
                2. If they ask about today, prioritize 'CURRENT PENDING TASKS'.
                3. Use Markdown for formatting (bolding, lists, etc.).
                4. Always be concise but helpful.
                """),
                ("user", "Context:\n{context}\n\nQuery: {query}")
            ])

            structured_llm = self.llm.with_structured_output(AssistantResponse)
            chain = prompt | structured_llm

            response = chain.invoke({
                "context": context_text,
                "query": request.message
            })

            # --- NEW: Save History to Supabase ---
            try:
                # Save User Message
                self.supabase.table("chat_messages").insert({
                    "user_id": request.user_id,
                    "role": "user",
                    "content": request.message
                }).execute()

                # Save Assistant Message
                self.supabase.table("chat_messages").insert({
                    "user_id": request.user_id,
                    "role": "assistant",
                    "content": response.conversational_reply,
                    "extracted_data": {
                        "tasks": response.extracted_tasks,
                        "reminders": response.extracted_reminders
                    }
                }).execute()
            except Exception as history_err:
                print(f"Failed to save chat history: {history_err}")

            return {
                "response": response.conversational_reply,
                "extracted_tasks": response.extracted_tasks,
                "extracted_reminders": response.extracted_reminders
            }

        except Exception as e:
            print(f"Chat Error: {e}")
            return {
                "response": f"I hit a snag: {str(e)}",
                "extracted_tasks": [],
                "extracted_reminders": []
            }

    async def generate_analysis(self, request: AnalyzeRequest) -> list[str]:
        try:
            tasks_res = self.supabase.table('tasks').select('title').eq('user_id', request.user_id).eq('status', 'pending').execute()
            tasks_text = ", ".join([t['title'] for t in tasks_res.data]) if tasks_res.data else "None"

            # Use hybrid search to find habits/long term context for analysis
            habits_context = self._hybrid_search(request.user_id, "daily habits and routines", k=3)

            prompt = ChatPromptTemplate.from_messages([
                ("system", "Generate 3 extremely concise daily brief points. Use the context of their habits if relevant."),
                ("user", "Tasks: {tasks}\nHabits: {habits}")
            ])

            chain = prompt | self.llm | StrOutputParser()
            response = chain.invoke({"tasks": tasks_text, "habits": habits_context})
            return [s.strip() for s in response.split('\n') if s.strip()][:3]
        except:
            return ["Review today's goals.", "Check your pending tasks.", "Stay focused!"]

    async def generate_daily_plan(self, request: PlanRequest) -> dict:
        try:
            tasks_res = self.supabase.table('tasks').select('title').eq('user_id', request.user_id).eq('status', 'pending').execute()
            tasks_text = json.dumps(tasks_res.data)

            # Retrieve planning context
            planning_context = self._hybrid_search(request.user_id, "work schedule and routine preferences", k=5)

            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert productivity planner. Create a daily schedule based on tasks and past routine preferences."),
                ("user", "Tasks: {tasks}\nContext: {context}")
            ])

            structured_llm = self.llm.with_structured_output(DailyPlan)
            chain = prompt | structured_llm
            response = chain.invoke({"context": planning_context, "tasks": tasks_text})
            return response.model_dump()
        except Exception as e:
            return {"optimized_schedule": [], "priority_order": [], "reasoning": str(e)}


ai_service = AIService()
