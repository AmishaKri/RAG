# created by Copilot CLI runtime in VS Code - placeholder

from fastapi import FastAPI
<<<<<<< Updated upstream

app=FastAPI()
=======
from app.api.router import api_router

from app.db.indexes import create_indexes

from app.db.qdrant import init_qdrant_collection



app = FastAPI(
    title="KnowledgeForge",
    description="Scalable RAG Evaluation & Serving System",
    version="1.0.0"
) 


init_qdrant_collection()

app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    create_indexes()
>>>>>>> Stashed changes

@app.get("/")
def read_root():
  return {"Hello": "World"}

# print("AI Project😀😀")