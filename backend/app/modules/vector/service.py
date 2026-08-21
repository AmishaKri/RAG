import uuid
from qdrant_client.http import models
from app.db.qdrant import qdrant_client
from app.core.config import settings
from app.modules.vector.embeddings import generate_dense_embeddings, generate_sparse_embeddings
from app.core.logging import logger
import math

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

    def hybrid_search(
        self,
        query: str,
        workspace_id: str,
        owner_id: str,
        top_k: int = 5,
        score_threshold: float | None = None,
    ) -> list[dict]:

        # Generate embeddings for the incoming query
        dense_query_vec = generate_dense_embeddings([query])[0]

        sparse_query_vec = list(
            generate_sparse_embeddings([query])
        )[0]

        # Log basic diagnostics (lengths, a small sample of values)
        try:
            logger.info("embeddings_generated", query=query, dense_len=len(dense_query_vec), sparse_indices_len=len(getattr(sparse_query_vec, 'indices', [])), sparse_values_len=len(getattr(sparse_query_vec, 'values', [])), dense_head=[float(x) for x in dense_query_vec[:5]])
        except Exception:
            # keep safe; don't crash search if logging fails
            pass

        search_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="workspace_id",
                    match=models.MatchValue(
                        value=workspace_id
                    ),
                ),
                models.FieldCondition(
                    key="owner_id",
                    match=models.MatchValue(
                        value=owner_id
                    ),
                ),
            ]
        )

        prefetch = [
            models.Prefetch(
                query=dense_query_vec,
                using="dense",
                filter=search_filter,
                limit=top_k * 2,
            ),

            models.Prefetch(
                query=models.SparseVector(
                    indices=sparse_query_vec.indices.tolist(),
                    values=sparse_query_vec.values.tolist(),
                ),
                using="sparse",
                filter=search_filter,
                limit=top_k * 2,
            ),
        ]

        results = qdrant_client.query_points(
            collection_name=self.collection_name,
            prefetch=prefetch,
            query=models.FusionQuery(
                fusion=models.Fusion.RRF
            ),
            limit=top_k,
        )

        output = []

        # Collect returned points and log small diagnostics about top scores
        scores = []
        for point in results.points:
            score = float(point.score) if point.score is not None else 0.0
            scores.append(score)
            output.append({
                "chunk_id": point.payload.get("chunk_id"),
                "document_id": point.payload.get("document_id"),
                "workspace_id": point.payload.get("workspace_id"),
                "owner_id": point.payload.get("owner_id"),
                "text": point.payload.get("text"),
                "chunk_index": point.payload.get("chunk_index"),
                "score": score,
            })

        try:
            top_scores = scores[:5]
            avg_score = sum(scores)/len(scores) if scores else 0.0
            logger.info("qdrant_query_result", collection=self.collection_name, returned=len(scores), top_scores=top_scores, avg_score=round(avg_score,4) if not math.isfinite(avg_score) else round(avg_score,4))
        except Exception:
            pass

        if score_threshold is not None:
            output = [item for item in output if item.get("score", 0) >= score_threshold]

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