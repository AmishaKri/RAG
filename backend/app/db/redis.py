import redis

from app.core.config import settings


redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)


def get_redis():
    return redis_client


def check_redis() -> bool:
    try:
        redis_client.ping()
        return True
    except redis.RedisError:
        return False