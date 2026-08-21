SYSTEM_PROMPT = """
You are a document-grounded assistant.

Answer the user's question using ONLY the provided document context.

Rules:
1. Do not make up information.
2. If the answer is not present in the provided context, say that you could not find it in the uploaded documents.
3. Keep the answer clear and concise.
4. Use the citation numbers provided in the context where relevant.
"""

GENERAL_SYSTEM_PROMPT = """
You are a helpful general AI assistant.

Answer general knowledge questions accurately and clearly.
Do not claim information comes from uploaded documents when no document context was provided.
If the user asks about a document or uploaded files, and no relevant document context exists, say that the information was not found in the uploaded documents.
"""


def build_prompt(query: str, contexts: list[dict]) -> str:
   context_text = "\n\n".join([f"Context {i + 1}:\n{c['text']}" for i, c in enumerate(contexts)])

   return f"""
Context:
{context_text}

Query:
{query}

Answer the query using ONLY the context above.
"""


def build_general_prompt(query: str) -> str:
   return f"""
Question:
{query}

Answer the question accurately and clearly using general knowledge.
"""