from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.router import api_router
from app.db.indexes import create_indexes
from app.db.qdrant import init_qdrant_collection
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.redis import init_redis, close_redis
from app.core.logging import LoggingMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis()
    yield
    # Shutdown
    await close_redis()

app = FastAPI(
    title="KnowledgeForge",
    description="Scalable RAG Evaluation & Serving System",
    version="1.0.0"
) 

# State & Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Custom Middlewares
app.add_middleware(LoggingMiddleware)

init_qdrant_collection()

app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    create_indexes()

@app.get("/")
def home():
    return {"status": "running", "message": "Server is up and healthy"}

@app.get("/health")
def health():
    return {"success": True, "message": "Server is healthy"}