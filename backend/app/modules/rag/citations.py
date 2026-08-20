def build_citations(contexts: list[dict]) -> str:
    citations = []
    for idx, context in enumerate(contexts):
        citations.append({
        "citation_id": idx + 1,
        "document_id": context.get("document_id"),
        "filename": context.get("filename"),
        "chunk_id": context.get("chunk_id"),
        "score": context.get("score"),
        })
    return citations
        