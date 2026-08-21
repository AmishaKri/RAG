from typing import Any
import hashlib
from fastapi import APIRouter, Depends, status
from app.schemas.vector import SearchQuery, SearchResult
from app.modules.vector.service import vector_service
from app.core.security import get_current_user
from app.core.redis import get_cache, set_cache
from app.core.config import settings
from app.core.logging import logger
import time

router = APIRouter(prefix="/search", tags=["Vector Search"])


def extract_user_id(user: Any) -> str:
    """Safely extracts user ID from dict or Pydantic model."""
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or user.get("user_id"))
    return str(getattr(user, "id", getattr(user, "_id", getattr(user, "user_id", ""))))


def generate_search_cache_key(user_id: str, workspace_id: str, query: str, top_k: int, score_threshold: float | None = None) -> str:
    """Generates a deterministic Redis cache key based on user, workspace, query, and threshold."""
    query_hash = hashlib.sha256(query.strip().lower().encode("utf-8")).hexdigest()[:16]
    threshold = f"{score_threshold:.3f}" if score_threshold is not None else "none"
    return f"search:{user_id}:{workspace_id}:{query_hash}:{top_k}:{threshold}"


@router.post("/hybrid", response_model=list[SearchResult], status_code=status.HTTP_200_OK)
async def search_hybrid(
    search_data: SearchQuery,
    current_user: Any = Depends(get_current_user),
):
    user_id = extract_user_id(current_user)
    
    effective_threshold = search_data.score_threshold if search_data.score_threshold is not None else settings.RAG_RELEVANCE_THRESHOLD

    # 1. Deterministic Cache Key Generate
    cache_key = generate_search_cache_key(
        user_id=user_id,
        workspace_id=search_data.workspace_id,
        query=search_data.query,
        top_k=search_data.top_k or 5,
        score_threshold=effective_threshold,
    )

    logger.info("search_request_received", user_id=user_id, workspace_id=search_data.workspace_id, query=search_data.query, top_k=search_data.top_k or 5, threshold=effective_threshold)

    # 2. Redis Cache Lookup
    cached_results = await get_cache(cache_key)
    if cached_results is not None:
        logger.info("search_cache_hit", cache_key=cache_key, results_count=len(cached_results))
        return cached_results

    # 3. Cache Miss: Qdrant Hybrid Search Execute
    start = time.perf_counter()
    results = vector_service.hybrid_search(
        query=search_data.query,
        workspace_id=search_data.workspace_id,
        owner_id=user_id,
        top_k=search_data.top_k or 5,
        score_threshold=effective_threshold,
    )
    elapsed = time.perf_counter() - start
    logger.info("search_qdrant_executed", duration_ms=round(elapsed*1000,2), returned=len(results))

    # 4. Result Serialized Dict/List 
    serialized_results = [
        item.model_dump() if hasattr(item, "model_dump") else item 
        for item in results
    ]
    await set_cache(cache_key, serialized_results, ttl=300)

    return results