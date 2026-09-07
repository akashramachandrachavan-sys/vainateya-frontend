import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, get_db
from .models import Survey, SonarFile, Detection, User
from .schemas import SystemMetrics
from .routers import surveys, detections, analysis, auth
from .services.storage import StorageService
from .auth import hash_password

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Operational and AI analysis backend for Side-Scan Sonar Marine Debris & Anomaly Detection (SIH PS 26057)"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for sonar images & reports
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(surveys.router, prefix=settings.API_V1_STR)
app.include_router(detections.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "NAADVEDH Sonar AI Backend",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NAADVEDH Sonar AI Backend",
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/api/metrics", response_model=SystemMetrics)
def get_system_metrics(db: Session = Depends(get_db)):
    total_surveys = db.query(Survey).count()
    total_files = db.query(SonarFile).count()
    total_detections = db.query(Detection).count()
    high_prio_count = db.query(Detection).filter(Detection.priority.in_(["HIGH", "CRITICAL"])).count()
    confirmed_count = db.query(Detection).filter(Detection.status == "CONFIRMED").count()

    rate = (confirmed_count / total_detections * 100) if total_detections > 0 else 0.0

    return SystemMetrics(
        total_surveys=total_surveys,
        total_files=total_files,
        total_detections=total_detections,
        high_priority_count=high_prio_count,
        confirmed_count=confirmed_count,
        verification_rate_percent=round(rate, 1)
    )

