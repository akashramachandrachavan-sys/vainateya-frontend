from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Detection, Survey
from ..schemas import (
    DetectionResponse,
    DetectionVerifyRequest,
    BBoxSchema,
    DimensionsSchema,
    LocationSchema
)

router = APIRouter(prefix="/detections", tags=["Detections"])

def format_detection_response(d: Detection) -> DetectionResponse:
    return DetectionResponse(
        id=d.id,
        code=d.code,
        survey_id=d.survey_id,
        file_id=d.file_id,
        class_name=d.class_name,
        label=d.label,
        confidence=d.confidence,
        priority=d.priority,
        bbox=BBoxSchema(
            x=d.bbox_x,
            y=d.bbox_y,
            width=d.bbox_w,
            height=d.bbox_h
        ),
        dimensions=DimensionsSchema(
            estimated_length_m=d.est_length_m,
            estimated_width_m=d.est_width_m,
            acoustic_shadow_length_m=d.acoustic_shadow_m
        ),
        location=LocationSchema(
            latitude=d.latitude,
            longitude=d.longitude,
            depth_m=d.depth_m
        ),
        status=d.status,
        notes=d.notes,
        verified_by=d.verified_by,
        created_at=d.created_at
    )

@router.get("", response_model=List[DetectionResponse])
def list_detections(
    survey_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    class_name: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Detection)
    if survey_id:
        query = query.filter(Detection.survey_id == survey_id)
    if status:
        query = query.filter(Detection.status == status)
    if class_name:
        query = query.filter(Detection.class_name == class_name)
    if priority:
        query = query.filter(Detection.priority == priority)

    detections = query.order_by(Detection.confidence.desc()).all()
    return [format_detection_response(d) for d in detections]

@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(detection_id: str, db: Session = Depends(get_db)):
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    return format_detection_response(detection)

@router.patch("/{detection_id}/verify", response_model=DetectionResponse)
def verify_detection(
    detection_id: str,
    payload: DetectionVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Human-in-the-Loop Operator Verification.
    Allows marine experts to confirm, reject, or mark anomalies for ROV investigation.
    """
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")

    detection.status = payload.status
    if payload.notes:
        detection.notes = payload.notes
    if payload.verified_by:
        detection.verified_by = payload.verified_by

    db.commit()
    db.refresh(detection)
    return format_detection_response(detection)
