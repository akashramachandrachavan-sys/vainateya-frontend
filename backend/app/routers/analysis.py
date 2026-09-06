from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Survey, SonarFile, Detection
from ..schemas import AnalysisTriggerResponse
from ..services.mock_ai import MockAIService

router = APIRouter(prefix="/surveys", tags=["AI Analysis"])

@router.post("/{survey_id}/analyze", response_model=AnalysisTriggerResponse)
def trigger_analysis(survey_id: str, db: Session = Depends(get_db)):
    """
    Triggers Side-Scan Sonar Debris & Anomaly Detection.
    Takes all files in the survey, executes inference, and persists structured detections.
    """
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    files = db.query(SonarFile).filter(SonarFile.survey_id == survey_id).all()
    if not files:
        raise HTTPException(status_code=400, detail="No sonar files uploaded for this survey")

    survey.status = "PROCESSING"
    db.commit()

    total_detections_found = 0
    total_time_ms = 0.0

    # Clear previous detections for a clean re-run if any
    db.query(Detection).filter(Detection.survey_id == survey_id).delete()

    for sf in files:
        inference_result = MockAIService.run_inference(
            image_path=sf.file_path,
            survey_lat=survey.latitude or 15.4128,
            survey_lon=survey.longitude or 73.7842,
            img_width=sf.width,
            img_height=sf.height
        )

        total_time_ms += inference_result["inference_duration_ms"]

        for det in inference_result["detections"]:
            detection_record = Detection(
                code=det["code"],
                survey_id=survey.id,
                file_id=sf.id,
                class_name=det["class_name"],
                label=det["label"],
                confidence=det["confidence"],
                priority=det["priority"],
                bbox_x=det["bbox"]["x"],
                bbox_y=det["bbox"]["y"],
                bbox_w=det["bbox"]["width"],
                bbox_h=det["bbox"]["height"],
                latitude=det["location"]["latitude"],
                longitude=det["location"]["longitude"],
                depth_m=det["location"]["depth_m"],
                est_length_m=det["dimensions"]["estimated_length_m"],
                est_width_m=det["dimensions"]["estimated_width_m"],
                acoustic_shadow_m=det["dimensions"]["acoustic_shadow_length_m"],
                status=det["status"],
                notes=det["notes"]
            )
            db.add(detection_record)
            total_detections_found += 1

        sf.status = "PROCESSED"

    survey.status = "ANALYZED"
    db.commit()

    return AnalysisTriggerResponse(
        survey_id=survey.id,
        status="ANALYZED",
        message=f"Analysis completed successfully. Identified {total_detections_found} acoustic anomalies.",
        detections_found=total_detections_found,
        execution_time_ms=round(total_time_ms, 1),
        model_version=MockAIService.MODEL_VERSION
    )
