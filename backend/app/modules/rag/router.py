from fastapi import APIRouter, Depends, HTTPException, status, Query
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
    mode: str | None = Query(
        None,
        description='Optional mode: "general" to force a general (non-document) answer, "document" to force document-grounded behavior',
        regex='^(general|document)$',
    ),
):
    """Ask a question.

    mode:
      - None: automatic behavior (existing) — use document context when relevant, otherwise fall back to general answer.
      - "general": force a general (non-document) answer.
      - "document": force document-grounded behavior (require relevant context when question mentions documents).
    """

    # Retrieve contexts only when not forcing general mode so we can emit useful citations.
    if mode == "general":
        contexts = []
    else:
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

        # Stream the actual answer. Choose stream based on mode to avoid unnecessary retrievals.
        if mode == "general":
            for chunk in rag_service._stream_general_answer(payload.query):
                yield chunk
            return

        # For automatic or forced document mode, use existing stream_answer (it performs relevance checks and will
        # fall back to general when appropriate unless mode == "document" which we want to enforce).
        if mode == "document":
            # Enforce document behavior: if no relevant contexts, emit not-found message directly.
            highest = max((float(c.get("score", 0.0)) for c in contexts), default=0.0)
            from app.core.config import settings

            if highest < settings.RAG_RELEVANCE_THRESHOLD:
                yield "I couldn't find the answer in your uploaded documents."
                return

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


@router.post("/ask-general")
def ask_general(
    payload: RAGRequest,
    current_user_id: str = Depends(
        get_current_user_id
    ),
):
    """Stream a general (non-document) answer using the general AI prompt.

    This endpoint ignores document retrieval and returns a general answer suitable for casual
    questions, chit-chat, or general-knowledge queries.
    """

    def gen():
        # Keep the same streaming preamble format so clients can handle it consistently
        try:
            yield "CITATIONS:[]\n"
        except Exception:
            pass

        for chunk in rag_service._stream_general_answer(payload.query):
            yield chunk

    return StreamingResponse(gen(), media_type="text/plain")
