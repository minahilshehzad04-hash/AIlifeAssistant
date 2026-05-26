# AI Life Admin Assistant

**AI Life Admin Assistant** is an intelligent personal memory and organization tool powered by Retrieval-Augmented Generation (RAG). It uses a Python backend integrated with the Google Gemini API to process natural language queries and provide highly context-aware responses. By leveraging Supabase and its `pgvector` extension for storing vector embeddings of user notes, tasks, and schedules, the assistant acts as a dynamic digital brain. It securely retrieves relevant personal data on the fly, reducing AI hallucinations and allowing users to seamlessly manage their daily lives, deadlines, and personal information through an intuitive interface.

## Key Features

- **Retrieval-Augmented Generation (RAG):** Combines LLM reasoning with personal database search to provide accurate, context-aware answers to user queries without relying on the AI's static training data alone.
- **Personal Knowledge Base:** Safely store notes, schedules, and tasks.
- **Vector Search (Memory Embeddings):** Automatically embeds all notes/tasks into vector representations using Supabase `pgvector`, allowing for rapid and accurate semantic similarity searches.
- **Intelligent Assistant:** Uses Google Gemini API to answer queries like "What meetings do I have tomorrow?" or summarize specific topics based on your saved data.

## Tech Stack

- **Frontend:** React/Next.js (Node.js)
- **Backend:** Python (FastAPI / Flask)
- **Database & Auth:** Supabase (PostgreSQL with `pgvector`)
- **AI/LLM:** Google Gemini API

## Getting Started

### Prerequisites
- Node.js & npm installed
- Python 3.8+ installed
- Supabase Project (with a `notes` and `memory_embeddings` table)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd my-life-admin-assistant
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   # Activate the virtual environment
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   ```
   *Create a `.env` file in the `backend` folder with your API keys:*
   ```env
   SUPABASE_URL="your-supabase-url"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You will need two separate terminal windows to run both the frontend and backend servers.

**Terminal 1 - Backend:**
```bash
cd backend
npm run backend # or the respective command to start your python server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will now be running locally.
