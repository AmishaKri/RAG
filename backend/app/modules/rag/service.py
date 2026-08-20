from collections.abc import Generator

from app.modules.rag.llm import get_llm
from app.modules.rag.prompt import SYSTEM_PROMPT, build_prompt
from app.modules.vector.service import vector_service


class RAGService:

    def __init__(self):
        self.llm = get_llm()

    def retrieve(
        self,
        *,
        query: str,
        workspace_id: str,
        owner_id: str,
        top_k: int = 5,
    ) -> list[dict]:

        return vector_service.hybrid_search(
            query=query,
            workspace_id=workspace_id,
            owner_id=owner_id,
            top_k=top_k,
        )

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
        )

        if not contexts:
            yield (
                "I could not find relevant information "
                "in the provided documents."
            )
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