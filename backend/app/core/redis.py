import json
from typing import Optional, Any
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> None:
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2
        )
        await redis_client.ping()
    except Exception:
        redis_client = None


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()


async def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        val = await redis_client.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


async def set_cache(key: str, value: Any, ttl: int = settings.CACHE_DEFAULT_TTL) -> bool:
    if not redis_client:
        return False
    try:
        await redis_client.set(key, json.dumps(value), ex=ttl)
        return True
    except Exception:
        return False


async def delete_cache_pattern(pattern: str) -> None:
    if not redis_client:
        return
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass