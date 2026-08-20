SYSTEM_PROMPT="""
You are a helpful RAG assistant.

Answer the user's question using ONLY the provided context.

Rules:
1. Do not make up information.
2. If the answer is not present in the context, say that you
   could not find the answer in the provided documents.
3. Keep the answer clear and concise.
4. Use the citation numbers provided in the context when possible.
"""

def build_prompt(query: str, contexts: list[dict]) -> str:
    context_text = "\n\n".join([f"Context {i+1}:\n{c['text']}" for i, c in enumerate(contexts)])
    
    return f"""
Context:
{context_text}

Query:
{query}

Answer the query using the context above.
"""