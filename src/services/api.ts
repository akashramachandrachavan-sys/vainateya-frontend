/**
 * NAADVEDH / VAINATEYA Marine Sonar Intelligence API Service
 * Connects frontend to the FastAPI backend with real JWT authentication.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${(import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, '')}/api`
  : '/api';

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

// Authentication Interfaces
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  phone?: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization?: string;
  phone?: string;
}

// Local Storage for Auth State
const TOKEN_KEY = 'vainateya_auth_token';
const USER_KEY = 'vainateya_auth_user';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { }
  },

  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { }
  },
};

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Auth
  async signin(payload: SigninPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errDetail = 'Invalid email or password.';
      try {
        const errJson = await res.json();
        if (errJson.detail) errDetail = errJson.detail;
      } catch { }
      throw new Error(errDetail);
    }

    const data: AuthResponse = await res.json();
    authStorage.setToken(data.access_token);
    authStorage.setUser(data.user);
    return data;
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errDetail = 'Failed to create account.';
      try {
        const errJson = await res.json();
        if (errJson.detail) errDetail = errJson.detail;
      } catch { }
      throw new Error(errDetail);
    }

    const data: AuthResponse = await res.json();
    authStorage.setToken(data.access_token);
    authStorage.setUser(data.user);
    return data;
  },

  async getMe(): Promise<AuthUser | null> {
    const token = authStorage.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          authStorage.clear();
        }
        return null;
      }
      const user: AuthUser = await res.json();
      authStorage.setUser(user);
      return user;
    } catch {
      return authStorage.getUser();
    }
  },

  logout(): void {
    authStorage.clear();
  },

  getCurrentUser(): AuthUser | null {
    return authStorage.getUser();
  },

  isAuthenticated(): boolean {
    return !!authStorage.getToken();
  },

  // Health
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  // System Metrics
  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Metrics failed: ${res.statusText}`);
    return res.json();
  },

  // Surveys
  async getSurveys(): Promise<ApiSurvey[]> {
    const res = await fetch(`${API_BASE}/surveys`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load surveys: ${res.statusText}`);
    return res.json();
  },

  async getSurvey(id: string): Promise<ApiSurvey> {
    const res = await fetch(`${API_BASE}/surveys/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load survey ${id}: ${res.statusText}`);
    return res.json();
  },

  async createSurvey(payload: CreateSurveyPayload): Promise<ApiSurvey> {
    const res = await fetch(`${API_BASE}/surveys`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create survey: ${res.statusText}`);
    return res.json();
  },

  // Sonar Files
  async getSurveyFiles(surveyId: string): Promise<ApiSonarFile[]> {
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/files`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load files for survey ${surveyId}: ${res.statusText}`);
    return res.json();
  },

  async uploadSonarFile(surveyId: string, file: File): Promise<ApiSonarFile> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/files`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to upload file ${file.name}: ${res.statusText}`);
    return res.json();
  },

  // AI Inference Analysis
  async triggerAnalysis(surveyId: string): Promise<AnalysisTriggerResponse> {
    const res = await fetch(`${API_BASE}/surveys/${surveyId}/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    const res = await fetch(`${API_BASE}/detections${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load detections: ${res.statusText}`);
    return res.json();
  },

  async getDetection(id: string): Promise<ApiDetection> {
    const res = await fetch(`${API_BASE}/detections/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load detection ${id}: ${res.statusText}`);
    return res.json();
  },

  async verifyDetection(detectionId: string, payload: VerifyDetectionPayload): Promise<ApiDetection> {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to verify detection: ${res.statusText}`);
    return res.json();
  },
};
