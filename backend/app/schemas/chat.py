# created by Copilot CLI runtime in VS Code - placeholder
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


# --- Message Schemas ---
class MessageBase(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    citations: Optional[List[Dict[str, Any]]] = []


class MessageCreate(BaseModel):
    content: str
    role: Literal["user", "assistant"] = "user"


class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    feedback: Optional[Dict[str, Any]] = None
    created_at: datetime


# --- Conversation Schemas ---
class ConversationCreate(BaseModel):
    workspace_id: str
    title: Optional[str] = "New Conversation"


class ConversationUpdate(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    id: str
    workspace_id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime


# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    rating: Literal["like", "dislike"]
   
class FeedbackResponse(BaseModel):
    message_id: str
    rating: str
    updated_at: datetime


# --- Evaluation Schemas ---
class EvaluationRequest(BaseModel):
    query: str
    context: List[str]
    answer: str


class EvaluationResponse(BaseModel):
    faithfulness_score: float = Field(..., description="Score 0-1 on groundedness in context")
    relevance_score: float = Field(..., description="Score 0-1 on how directly answer answers query")
    reasoning: str