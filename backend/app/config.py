import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "NAADVEDH Sonar Intelligence API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: defaults to local SQLite file; can be overridden via DATABASE_URL to postgresql://...
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/naadvedh.db")
    
    # Storage
    STORAGE_DIR: Path = BASE_DIR / "storage"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://vainateya-frontend.vercel.app",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(BASE_DIR / "data", exist_ok=True)
os.makedirs(settings.STORAGE_DIR / "sonar_images", exist_ok=True)
os.makedirs(settings.STORAGE_DIR / "reports", exist_ok=True)
