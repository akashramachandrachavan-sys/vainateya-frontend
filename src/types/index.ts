export type DebrisCategory =
  | 'ghost_net'
  | 'metal_drum'
  | 'cargo_container'
  | 'sunken_vessel'
  | 'tire_cluster'
  | 'plastic_debris';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface BoundingBox {
  x: number;       // Percentage (0-100)
  y: number;       // Percentage (0-100)
  width: number;   // Percentage (0-100)
  height: number;  // Percentage (0-100)
}

export interface DebrisDetection {
  id: string;
  name: string;
  category: DebrisCategory;
  confidence: number; // e.g. 96.4
  bbox: BoundingBox;
  coordinates: {
    lat: number;
    lng: number;
  };
  depthMeters: number;
  shadowLengthMeters: number;
  estimatedHeightMeters: number;
  acousticShadowVerified: boolean;
  severity: SeverityLevel;
  timestamp: string;
  materialComposition: string;
}

export interface SonarScan {
  id: string;
  title: string;
  sector: string;
  surveyVessel: string;
  frequencyKhz: number;
  altitudeMeters: number;
  slantRangeMeters: number;
  imageUrl: string;
  detections: DebrisDetection[];
  description: string;
  dateCaptured: string;
}

export type UserRole =
  | 'Marine Scientist'
  | 'Port & Harbor Authority'
  | 'Cleanup Fleet Coordinator'
  | 'Environmental Researcher';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
}

export type ActiveView = 'landing' | 'studio' | 'map' | 'analytics' | 'auth';
