from typing import Any
from fastapi import APIRouter, Depends, status, Body
from app.core.security import get_current_user
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    FeedbackCreate,
    FeedbackResponse,
    EvaluationRequest,
    EvaluationResponse,
)
from app.modules.chat.service import chat_service

router = APIRouter(prefix="/chat", tags=["Conversations & Feedback"])


def extract_user_id(user: Any) -> str:
    """Safely extracts user ID from dict or Pydantic model."""
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or user.get("user_id"))
    return str(getattr(user, "id", getattr(user, "_id", getattr(user, "user_id", ""))))


# --- Conversation Endpoints ---
@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    current_user: Any = Depends(get_current_user),
):
    user_id = extract_user_id(current_user)
    return chat_service.create_conversation(
        user_id=user_id,
        workspace_id=payload.workspace_id,
        title=payload.title or "New Conversation",
    )


@router.get("/conversations", response_model=list[ConversationResponse])
def get_conversations(
    workspace_id: str,
    current_user: Any = Depends(get_current_user),
):
    user_id = extract_user_id(current_user)
    return chat_service.get_user_conversations(
        user_id=user_id,
        workspace_id=workspace_id,
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    current_user: Any = Depends(get_current_user),
):
    user_id = extract_user_id(current_user)
    chat_service.delete_conversation(
        conversation_id=conversation_id,
        user_id=user_id,
    )
    return None


# --- Message & Feedback Endpoints ---
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: str,
    payload: MessageCreate = Body(...),
    current_user: Any = Depends(get_current_user),
):
    return chat_service.add_message(
        conversation_id=conversation_id,
        role=payload.role,
        content=payload.content,
        citations=[],
    )


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    current_user: Any = Depends(get_current_user),
):
    return chat_service.get_messages(conversation_id=conversation_id)


@router.post("/messages/{message_id}/feedback", response_model=FeedbackResponse)
def submit_feedback(
    message_id: str,
    payload: FeedbackCreate = Body(...),
    current_user: Any = Depends(get_current_user),
):
    return chat_service.record_feedback(
        message_id=message_id,
        feedback_data=payload.model_dump(),
    )


# --- Evaluation Endpoint ---
@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_rag(
    payload: EvaluationRequest,
    current_user: Any = Depends(get_current_user),
):
    return chat_service.evaluate_response(
        query=payload.query,
        context=payload.context,
        answer=payload.answer,
    )