import random
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import Survey, SonarFile, Detection
from ..schemas import SurveyCreate, SurveyResponse, SonarFileResponse
from ..services.storage import StorageService

router = APIRouter(prefix="/surveys", tags=["Surveys"])

def format_survey_response(s: Survey, db: Session) -> SurveyResponse:
    file_count = db.query(SonarFile).filter(SonarFile.survey_id == s.id).count()
    det_query = db.query(Detection).filter(Detection.survey_id == s.id)
    det_count = det_query.count()
    high_prio_count = det_query.filter(Detection.priority.in_(["HIGH", "CRITICAL"])).count()
    confirmed_count = det_query.filter(Detection.status == "CONFIRMED").count()

    return SurveyResponse(
        id=s.id,
        code=s.code or f"SURV-{s.id[:6].upper()}",
        name=s.name,
        location_name=s.location_name,
        latitude=s.latitude,
        longitude=s.longitude,
        operator=s.operator,
        sonar_device=s.sonar_device,
        description=s.description,
        status=s.status,
        created_at=s.created_at,
        file_count=file_count,
        detection_count=det_count,
        high_priority_count=high_prio_count,
        confirmed_count=confirmed_count
    )

@router.get("", response_model=List[SurveyResponse])
def list_surveys(db: Session = Depends(get_db)):
    surveys = db.query(Survey).order_by(Survey.created_at.desc()).all()
    return [format_survey_response(s, db) for s in surveys]

@router.post("", response_model=SurveyResponse)
def create_survey(payload: SurveyCreate, db: Session = Depends(get_db)):
    count = db.query(Survey).count()
    code = f"SURV-{2026}-{count + 1:03d}"
    
    survey = Survey(
        code=code,
        name=payload.name,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        operator=payload.operator or "NIOT Marine Survey Team",
        sonar_device=payload.sonar_device or "Klein 3000 Side-Scan Sonar",
        description=payload.description,
        status="READY"
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    
    # Auto-generate one initial demo sonar image for testing if survey has no files yet
    rel_path, filepath, size, w, h = StorageService.generate_demo_sonar_image(survey.id)
    sonar_file = SonarFile(
        survey_id=survey.id,
        filename="transect_sss_line_01.png",
        file_path=rel_path,
        file_size_bytes=size,
        mime_type="image/png",
        width=w,
        height=h,
        range_meters=75.0,
        frequency_khz=455.0,
        status="UPLOADED"
    )
    db.add(sonar_file)
    db.commit()

    return format_survey_response(survey, db)

@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(survey_id: str, db: Session = Depends(get_db)):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return format_survey_response(survey, db)

@router.get("/{survey_id}/files", response_model=List[SonarFileResponse])
def get_survey_files(survey_id: str, db: Session = Depends(get_db)):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    files = db.query(SonarFile).filter(SonarFile.survey_id == survey_id).all()
    results = []
    for f in files:
        results.append(SonarFileResponse(
            id=f.id,
            survey_id=f.survey_id,
            filename=f.filename,
            file_size_bytes=f.file_size_bytes,
            mime_type=f.mime_type,
            width=f.width,
            height=f.height,
            range_meters=f.range_meters,
            frequency_khz=f.frequency_khz,
            status=f.status,
            created_at=f.created_at,
            url=f"/storage/{f.file_path}"
        ))
    return results

@router.post("/{survey_id}/files", response_model=SonarFileResponse)
async def upload_sonar_file(
    survey_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    rel_path, filepath, size = await StorageService.save_upload(file, survey_id)
    
    sonar_file = SonarFile(
        survey_id=survey.id,
        filename=file.filename,
        file_path=rel_path,
        file_size_bytes=size,
        mime_type=file.content_type or "image/png",
        width=1200,
        height=700,
        range_meters=75.0,
        frequency_khz=455.0,
        status="UPLOADED"
    )
    db.add(sonar_file)
    db.commit()
    db.refresh(sonar_file)

    return SonarFileResponse(
        id=sonar_file.id,
        survey_id=sonar_file.survey_id,
        filename=sonar_file.filename,
        file_size_bytes=sonar_file.file_size_bytes,
        mime_type=sonar_file.mime_type,
        width=sonar_file.width,
        height=sonar_file.height,
        range_meters=sonar_file.range_meters,
        frequency_khz=sonar_file.frequency_khz,
        status=sonar_file.status,
        created_at=sonar_file.created_at,
        url=f"/storage/{sonar_file.file_path}"
    )
