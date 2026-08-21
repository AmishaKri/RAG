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
    # Retrieve contexts to include as a preamble in the stream so the frontend can show citations
    contexts = rag_service.retrieve(
        query=payload.query,
        workspace_id=payload.workspace_id,
        owner_id=current_user_id,
        top_k=5,
    )

    def combined_generator():
        # Emit a preamble with the top citations (as JSON) so clients can display them before streaming text
        try:
            import json
            pre = json.dumps(contexts[:4])
            yield f"CITATIONS:{pre}\n"
        except Exception:
            # ignore serialization errors and continue streaming
            pass

        # Now stream the actual answer (stream_answer will perform its own retrieve+decision)
        for chunk in rag_service.stream_answer(
            query=payload.query,
            workspace_id=payload.workspace_id,
            owner_id=current_user_id,
        ):
            yield chunk

    return StreamingResponse(
        combined_generator(),
        media_type="text/plain",
    )
