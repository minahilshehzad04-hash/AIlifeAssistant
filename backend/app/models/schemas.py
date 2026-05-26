from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    user_id: str

class ChatResponse(BaseModel):
    response: str
    extracted_tasks: List[str] = []
    extracted_reminders: List[str] = []

class AnalyzeRequest(BaseModel):
    user_id: str
    context_type: Optional[str] = "daily" # e.g., 'daily', 'weekly', 'tasks'

class AnalyzeResponse(BaseModel):
    suggestions: List[str]

class IngestRequest(BaseModel):
    user_id: str
    text_content: str
    source_type: str
    source_id: str

class PlanRequest(BaseModel):
    user_id: str

class TimeBlock(BaseModel):
    time_range: str
    task_title: str
    description: str
    priority: str

class DailyPlan(BaseModel):
    optimized_schedule: List[TimeBlock]
    priority_order: List[str]
    reasoning: str
