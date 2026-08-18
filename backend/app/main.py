from fastapi import FastAPI
from app.api.router import api_router
from app.db.indexes import create_indexes


app = FastAPI(
    title="KnowledgeForge",
    description="Scalable RAG Evaluation & Serving System",
    version="1.0.0"
) 

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