from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MONGODB_URL: str
    DATABASE_NAME: str = "knowledgeForge"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "knowledgeforge_chunks"
    EMBEDDING_DIMENSION: int = 384  

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = True
    CACHE_DEFAULT_TTL: int = 300  
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_AUTH: str = "5/minute"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    raise