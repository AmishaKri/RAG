from pydantic import BaseModel, Field

class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, description="Search query string")
    workspace_id: str = Field(..., description="Target workspace ID")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    score_threshold: float = Field(default=0.3, ge=0.0, le=1.0)

class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    workspace_id: str
    text: str
    chunk_index: int
    score: float
