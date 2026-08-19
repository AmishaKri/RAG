import uuid
from qdrant_client.http import models
from app.db.qdrant import qdrant_client
from app.core.config import settings
from app.modules.vector.embeddings import generate_dense_embeddings, generate_sparse_embeddings

class VectorService:
    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    def index_chunks(self, chunks: list[dict]):
        if not chunks:
            return

        texts = [chunk["text"] for chunk in chunks]
        dense_vectors = generate_dense_embeddings(texts)
        sparse_vectors = generate_sparse_embeddings(texts)

        points = []
        for i, chunk in enumerate(chunks):
            sparse_vec = sparse_vectors[i]
            point = models.PointStruct(
                id=str(uuid.uuid4()),
                vector={
                    "dense": dense_vectors[i],
                    "sparse": models.SparseVector(
                        indices=sparse_vec.indices.tolist(),
                        values=sparse_vec.values.tolist(),
                    ),
                },
                payload={
                    "chunk_id": str(chunk.get("_id", "")),
                    "document_id": str(chunk["document_id"]),
                    "workspace_id": str(chunk["workspace_id"]),
                    "owner_id": str(chunk["owner_id"]),
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"],
                    "start_word": chunk["start_word"],
                    "end_word": chunk["end_word"],
                }
            )
            points.append(point)

        qdrant_client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def hybrid_search(self, query: str, workspace_id: str, top_k: int = 5) -> list[dict]:
        dense_query_vec = generate_dense_embeddings([query])[0]
        sparse_query_vec = list(generate_sparse_embeddings([query]))[0]

        prefetch = [
            models.Prefetch(
                query=dense_query_vec,
                using="dense",
                filter=models.Filter(
                    must=[models.FieldCondition(key="workspace_id", match=models.MatchValue(value=workspace_id))]
                ),
                limit=top_k * 2,
            ),
            models.Prefetch(
                query=models.SparseVector(
                    indices=sparse_query_vec.indices.tolist(),
                    values=sparse_query_vec.values.tolist(),
                ),
                using="sparse",
                filter=models.Filter(
                    must=[models.FieldCondition(key="workspace_id", match=models.MatchValue(value=workspace_id))]
                ),
                limit=top_k * 2,
            ),
        ]

        results = qdrant_client.query_points(
            collection_name=self.collection_name,
            prefetch=prefetch,
            query=models.FusionQuery(fusion=models.Fusion.RRF),
            limit=top_k,
        )

        output = []
        for point in results.points:
            output.append({
                "chunk_id": point.payload.get("chunk_id"),
                "document_id": point.payload.get("document_id"),
                "workspace_id": point.payload.get("workspace_id"),
                "text": point.payload.get("text"),
                "chunk_index": point.payload.get("chunk_index"),
                "score": point.score,
            })
        return output

    def delete_document_vectors(self, document_id: str):
        qdrant_client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))]
                )
            )
        )

vector_service = VectorService()