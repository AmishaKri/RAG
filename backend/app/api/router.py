from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.workspaces.router import router as workspace_router
from app.modules.documents.router import router as document_router
from app.modules.vector.router import router as vector_router
from app.modules.chat.router import router as chat_router  

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(workspace_router)
api_router.include_router(document_router)
api_router.include_router(vector_router)
api_router.include_router(chat_router)