import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScholarPulse — AI Research Digest & Literature Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default="scholarpulse-super-secret-jwt-key-change-in-production-2026", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./scholarpulse.db", env="DATABASE_URL")
    
    # AI Keys (Optional - gracefully falls back to deterministic/local mock & rule-based engine when absent)
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    SEMANTIC_SCHOLAR_API_KEY: str = Field(default="", env="SEMANTIC_SCHOLAR_API_KEY")
    
    # AI Engine & Vector Store
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    VECTOR_DB_TYPE: str = "in_memory_chroma" # or chroma, qdrant, faiss
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 100
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt", ".md"]
    UPLOAD_DIR: str = "./uploads"
    
    # Email & Admin Notifications
    ADMIN_NOTIFICATION_EMAIL: str = Field(default="", env="ADMIN_NOTIFICATION_EMAIL")
    SMTP_SERVER: str = Field(default="smtp.gmail.com", env="SMTP_SERVER")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USERNAME: str = Field(default="", env="SMTP_USERNAME")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")
    SEND_REGISTRATION_EMAILS: bool = Field(default=True, env="SEND_REGISTRATION_EMAILS")
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
