from pydantic import BaseModel, Field

class RAGRequest(BaseModel):
    query: str = Field(..., min_length=1,  max_length=5000,)
    workspace_id: str
    

class Citation(BaseModel):
    citation_id: int
    document_id: str | None = None
    filename: str | None = None
    chunk_id: str | None = None
    score: float | None = None
    
class RAGResponse(BaseModel):
    answer: str
    citations: list[Citation]
    
    