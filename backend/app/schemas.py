from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Bounding Box
class BBoxSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float

# Dimensions
class DimensionsSchema(BaseModel):
    estimated_length_m: Optional[float] = None
    estimated_width_m: Optional[float] = None
    acoustic_shadow_length_m: Optional[float] = None

# Location
class LocationSchema(BaseModel):
    latitude: float
    longitude: float
    depth_m: Optional[float] = 25.0

# Detection Schemas
class DetectionBase(BaseModel):
    class_name: str
    label: str
    confidence: float
    priority: str = "HIGH"
    bbox: BBoxSchema
    dimensions: Optional[DimensionsSchema] = None
    location: LocationSchema
    status: str = "DETECTED"
    notes: Optional[str] = None

class DetectionCreate(DetectionBase):
    code: Optional[str] = None
    survey_id: str
    file_id: Optional[str] = None

class DetectionVerifyRequest(BaseModel):
    status: str = Field(..., pattern="^(CONFIRMED|REJECTED|INVESTIGATING|DETECTED)$")
    notes: Optional[str] = None
    verified_by: Optional[str] = "Marine Operator"

class DetectionResponse(BaseModel):
    id: str
    code: Optional[str] = None
    survey_id: str
    file_id: Optional[str] = None
    class_name: str
    label: str
    confidence: float
    priority: str
    bbox: BBoxSchema
    dimensions: Optional[DimensionsSchema] = None
    location: LocationSchema
    status: str
    notes: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Sonar File Schemas
class SonarFileResponse(BaseModel):
    id: str
    survey_id: str
    filename: str
    file_size_bytes: int
    mime_type: str
    width: int
    height: int
    range_meters: float
    frequency_khz: float
    status: str
    created_at: datetime
    url: Optional[str] = None

    class Config:
        from_attributes = True

# Survey Schemas
class SurveyCreate(BaseModel):
    name: str
    location_name: str = "Indian Ocean Coastal Shelf"
    latitude: Optional[float] = 15.4128
    longitude: Optional[float] = 73.7842
    operator: Optional[str] = "NIOT Marine Survey Team"
    sonar_device: Optional[str] = "Klein 3000 Side-Scan Sonar"
    description: Optional[str] = None

class SurveyResponse(BaseModel):
    id: str
    code: Optional[str] = None
    name: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operator: str
    sonar_device: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    file_count: int = 0
    detection_count: int = 0
    high_priority_count: int = 0
    confirmed_count: int = 0

    class Config:
        from_attributes = True

# Analysis Schemas
class AnalysisTriggerResponse(BaseModel):
    survey_id: str
    status: str
    message: str
    detections_found: int
    execution_time_ms: float
    model_version: str

# System Stats
class SystemMetrics(BaseModel):
    total_surveys: int
    total_files: int
    total_detections: int
    high_priority_count: int
    confirmed_count: int
    verification_rate_percent: float


# Auth & User Schemas
class UserCreate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    password: str
    role: Optional[str] = "Marine Scientist"
    organization: Optional[str] = "VAINATEYA"
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    organization: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

