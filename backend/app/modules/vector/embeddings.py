from fastembed import TextEmbedding, SparseTextEmbedding

# Local, lightweight, fast embedding models (no API key required)
dense_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")

def generate_dense_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    embeddings = list(dense_model.embed(texts))
    return [emb.tolist() for emb in embeddings]

def generate_sparse_embeddings(texts: list[str]):
    if not texts:
        return []
    return list(sparse_model.embed(texts))