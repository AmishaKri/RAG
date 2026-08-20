from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user_id
from app.modules.rag.service import rag_service
from app.schemas.rag import RAGRequest, RAGResponse

router = APIRouter(prefix="/rag", tags=["RAG"])
@router.post("/ask")
def ask_question(
    payload: RAGRequest,
    current_user_id: str = Depends(
        get_current_user_id
    ),
):

    generator = rag_service.stream_answer(
        query=payload.query,
        workspace_id=payload.workspace_id,
        owner_id=current_user_id,
    )

    return StreamingResponse(
        generator,
        media_type="text/plain",
    )
