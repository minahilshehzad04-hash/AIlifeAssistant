from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse, AnalyzeRequest, AnalyzeResponse, IngestRequest, PlanRequest, DailyPlan
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint for conversational interaction with the AI assistant.
    """
    response_data = await ai_service.generate_chat_response(request)
    return ChatResponse(
        response=response_data["response"],
        extracted_tasks=response_data["extracted_tasks"],
        extracted_reminders=response_data["extracted_reminders"]
    )

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(request: AnalyzeRequest):
    """
    Endpoint to generate intelligent suggestions based on the user's data.
    """
    suggestions = await ai_service.generate_analysis(request)
    return AnalyzeResponse(suggestions=suggestions)

@router.post("/ingest")
async def ingest_endpoint(request: IngestRequest):
    """
    Endpoint to ingest a new task or note into the vector database.
    """
    return await ai_service.ingest_memory(request)

@router.post("/plan", response_model=DailyPlan)
async def plan_endpoint(request: PlanRequest):
    """
    Endpoint to generate an optimized daily schedule based on pending tasks and RAG context.
    """
    plan_data = await ai_service.generate_daily_plan(request)
    return DailyPlan(**plan_data)

