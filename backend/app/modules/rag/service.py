from collections.abc import Generator

from app.core.config import settings
from app.modules.rag.llm import get_llm
from app.modules.rag.prompt import GENERAL_SYSTEM_PROMPT, SYSTEM_PROMPT, build_general_prompt, build_prompt
from app.modules.vector.service import vector_service


class RAGService:
    DOCUMENT_HINTS = (
        "according to my resume",
        "according to the uploaded",
        "in the uploaded document",
        "in my pdf",
        "mentioned in my document",
        "what does the document say",
        "what is mentioned in",
        "based on these documents",
        "based on my documents",
        "based on the uploaded documents",
        "according to the document",
        "according to my uploaded",
        "resume",
        "pdf",
        "docx",
        "document",
        "uploaded file",
        "upload",
        "workspace",
    )

    def __init__(self):
        self.llm = get_llm()

    @staticmethod
    def is_document_specific_question(query: str) -> bool:
        normalized = query.strip().lower()
        if not normalized:
            return False
        return any(hint in normalized for hint in RAGService.DOCUMENT_HINTS)

    @staticmethod
    def has_sufficient_relevance(contexts: list[dict]) -> bool:
        if not contexts:
            return False
        highest_score = max((float(context.get("score", 0.0)) for context in contexts), default=0.0)
        return highest_score >= settings.RAG_RELEVANCE_THRESHOLD

    def retrieve(
        self,
        *,
        query: str,
        workspace_id: str,
        owner_id: str,
        top_k: int = 5,
        score_threshold: float | None = None,
    ) -> list[dict]:
        effective_threshold = score_threshold if score_threshold is not None else settings.RAG_RELEVANCE_THRESHOLD
        return vector_service.hybrid_search(
            query=query,
            workspace_id=workspace_id,
            owner_id=owner_id,
            top_k=top_k,
            score_threshold=effective_threshold,
        )

    def _stream_general_answer(self, query: str) -> Generator[str, None, None]:
        prompt = build_general_prompt(query)
        for chunk in self.llm.stream(
            [
                ("system", GENERAL_SYSTEM_PROMPT),
                ("human", prompt),
            ]
        ):
            if chunk.content:
                yield chunk.content

    def stream_answer(
        self,
        *,
        query: str,
        workspace_id: str,
        owner_id: str,
    ) -> Generator[str, None, None]:
        contexts = self.retrieve(
            query=query,
            workspace_id=workspace_id,
            owner_id=owner_id,
            score_threshold=settings.RAG_RELEVANCE_THRESHOLD,
        )

        is_document_question = self.is_document_specific_question(query)
        has_relevant_context = self.has_sufficient_relevance(contexts)

        if is_document_question:
            if not has_relevant_context:
                yield "I couldn't find the answer in your uploaded documents."
                return
        elif not has_relevant_context:
            yield from self._stream_general_answer(query)
            return

        prompt = build_prompt(
            query=query,
            contexts=contexts,
        )

        for chunk in self.llm.stream(
            [
                ("system", SYSTEM_PROMPT),
                ("human", prompt),
            ]
        ):
            if chunk.content:
                yield chunk.content


rag_service = RAGService()