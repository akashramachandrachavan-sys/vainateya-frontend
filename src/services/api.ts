/**
 * NAADVEDH / VAINATEYA Marine Sonar Intelligence API Service
 * Connects frontend to the FastAPI backend.
 */

const API_BASE = '/api';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dimensions {
  estimated_length_m?: number;
  estimated_width_m?: number;
  acoustic_shadow_length_m?: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  depth_m?: number;
}

export interface ApiDetection {
  id: string;
  code?: string | null;
  survey_id: string;
  file_id?: string | null;
  class_name: string;
  label: string;
  confidence: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  bbox: BoundingBox;
  dimensions?: Dimensions;
  location: LocationCoordinates;
  status: 'DETECTED' | 'CONFIRMED' | 'REJECTED' | 'INVESTIGATING' | string;
  notes?: string | null;
  verified_by?: string | null;
  created_at: string;
}

export interface ApiSonarFile {
  id: string;
  survey_id: string;
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  width: number;
  height: number;
  range_meters: number;
  frequency_khz: number;
  status: string;
  created_at: string;
  url?: string | null;
}

export interface ApiSurvey {
  id: string;
  code?: string | null;
  name: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  operator: string;
  sonar_device: string;
  description?: string | null;
  status: string;
  created_at: string;
  file_count: number;
  detection_count: number;
  high_priority_count: number;
  confirmed_count: number;
}

export interface CreateSurveyPayload {
  name: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  operator?: string;
  sonar_device?: string;
  description?: string;
}

export interface VerifyDetectionPayload {
  status: 'CONFIRMED' | 'REJECTED' | 'INVESTIGATING' | 'DETECTED';
  notes?: string;
  verified_by?: string;
}

export interface AnalysisTriggerResponse {
  survey_id: string;
  status: string;
  message: string;
  detections_found: number;
  execution_time_ms: number;
  model_version: string;
}

export interface SystemMetrics {
  total_surveys: number;
  total_files: number;
  total_detections: number;
  high_priority_count: number;
  confirmed_count: number;
  verification_rate_percent: number;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  database: string;
}

export const apiService = {
  // Health
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  // System Metrics
  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error(`Metrics failed: ${res.statusText}`);
    return res.json();
  },

  // Surveys
  async getSurveys(): Promise<ApiSurvey[]> {
    const res = await fetch(`${API_BASE}/surveys`);
    if (!res.ok) throw new Error(`Failed to load surveys: ${res.statusText}`);
    return res.json();
  },

  async getSurvey(id: string): Promise<ApiSurvey> {
    const res = await fetch(`${API_BASE}/surveys/${id}`);
    if (!res.ok) throw new Error(`Failed to load survey ${id}: ${res.statusText}`);
    return res.json();
  },

  async createSurvey(payload: CreateSurveyPayload): Promise<ApiSurvey> {
    const res = await fetch(`${API_BASE}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create survey: ${res.statusText}`);
    return res.json();
  },

  // Sonar Files
  async getSurveyFiles(surveyId: string): Promise<ApiSonarFile[]> {
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/files`);
    if (!res.ok) throw new Error(`Failed to load files for survey ${surveyId}: ${res.statusText}`);
    return res.json();
  },

  async uploadSonarFile(surveyId: string, file: File): Promise<ApiSonarFile> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/files`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to upload file ${file.name}: ${res.statusText}`);
    return res.json();
  },

  // AI Inference Analysis
  async triggerAnalysis(surveyId: string): Promise<AnalysisTriggerResponse> {
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to trigger analysis: ${res.statusText}`);
    return res.json();
  },

  // Detections
  async getDetections(surveyId?: string, status?: string): Promise<ApiDetection[]> {
    const params = new URLSearchParams();
    if (surveyId) params.append('survey_id', surveyId);
    if (status) params.append('status', status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/detections${qs}`);
    if (!res.ok) throw new Error(`Failed to load detections: ${res.statusText}`);
    return res.json();
  },

  async getDetection(id: string): Promise<ApiDetection> {
    const res = await fetch(`${API_BASE}/detections/${id}`);
    if (!res.ok) throw new Error(`Failed to load detection ${id}: ${res.statusText}`);
    return res.json();
  },

  async verifyDetection(detectionId: string, payload: VerifyDetectionPayload): Promise<ApiDetection> {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to verify detection: ${res.statusText}`);
    return res.json();
  },
};
