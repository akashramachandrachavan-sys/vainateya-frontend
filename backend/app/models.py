import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True) # e.g. SURV-001
    name = Column(String, nullable=False)
    location_name = Column(String, default="Indian Ocean Shelf")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    operator = Column(String, default="NIOT Marine Survey Team")
    sonar_device = Column(String, default="Klein 3000 Side-Scan Sonar")
    description = Column(Text, nullable=True)
    status = Column(String, default="READY") # READY, PROCESSING, ANALYZED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    files = relationship("SonarFile", back_populates="survey", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="survey", cascade="all, delete-orphan")

class SonarFile(Base):
    __tablename__ = "sonar_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    survey_id = Column(String, ForeignKey("surveys.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String, default="image/png")
    width = Column(Integer, default=1200)
    height = Column(Integer, default=700)
    range_meters = Column(Float, default=75.0)
    frequency_khz = Column(Float, default=455.0)
    status = Column(String, default="UPLOADED") # UPLOADED, PROCESSED, ERROR
    created_at = Column(DateTime, default=datetime.utcnow)

    survey = relationship("Survey", back_populates="files")
    detections = relationship("Detection", back_populates="sonar_file", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, index=True) # e.g. DET-001
    survey_id = Column(String, ForeignKey("surveys.id"), nullable=False)
    file_id = Column(String, ForeignKey("sonar_files.id"), nullable=True)
    
    # Classification
    class_name = Column(String, nullable=False) # fishing_gear, pipe, container, shipwreck_debris, artificial_anomaly
    label = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    priority = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL

    # Bounding Box (pixel coordinates)
    bbox_x = Column(Float, nullable=False)
    bbox_y = Column(Float, nullable=False)
    bbox_w = Column(Float, nullable=False)
    bbox_h = Column(Float, nullable=False)

    # Spatial Coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth_m = Column(Float, default=25.0)

    # Physical Estimation
    est_length_m = Column(Float, default=0.0)
    est_width_m = Column(Float, default=0.0)
    acoustic_shadow_m = Column(Float, default=0.0)

    # Human in the Loop Workflow
    status = Column(String, default="DETECTED") # DETECTED, CONFIRMED, REJECTED, INVESTIGATING
    notes = Column(Text, nullable=True)
    verified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    survey = relationship("Survey", back_populates="detections")
    sonar_file = relationship("SonarFile", back_populates="detections")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Marine Scientist")
    organization = Column(String, default="VAINATEYA")
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

