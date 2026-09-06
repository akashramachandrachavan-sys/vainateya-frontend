export type DashboardScreen = 'dashboard' | 'new-survey' | 'surveys' | 'map' | 'settings';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'alert' | 'success' | 'info';
}

export interface DetectionItem {
  id: string;
  type: 'Fishing Gear' | 'Debris' | 'Unknown';
  confidence: number;
  lat: string;
  lng: string;
  color: string;
  status: 'Confirmed' | 'Pending Review' | 'Rejected';
  operatorNote?: string;
  shadowLengthMeters: number;
  estimatedHeightMeters: number;
}

export interface UploadedFileItem {
  name: string;
  size: string;
  thumbnail: string;
  rawFile?: File;
}

export interface MapDetection {
  id: string;
  number: string;
  name: string;
  confidence: number;
  lat: string;
  lng: string;
  rawLat: number;
  rawLng: number;
  status: 'Verified' | 'Unverified';
  category: 'Pipeline' | 'Anomaly' | 'Fishing Gear' | 'Debris';
  color: string;
  markerType: 'green' | 'red' | 'blue' | 'yellow';
  thumb: string;
}

export interface SurveyCatalogItem {
  id: string;
  number: string;
  name: string;
  date: string;
  fullDate: string;
  location: string;
  images: number;
  detections: number;
  status: 'Completed' | 'Processing' | 'High Priority' | 'Archived' | 'Ready';
  description: string;
  verifiedCount: number;
  unclassifiedCount: number;
}

export interface BatchDetectionObject {
  id: string;
  orderNumber: number;
  name: string;
  type: string;
  confidence: number;
  coordinates: string;
  size: string;
  color: 'red' | 'blue' | 'amber';
  hexColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  tagColor: string;
  badgeBg: string;
  bbox: { top: string; left: string; width: string; height: string };
  thumb: string;
}

export interface BatchImageResult {
  id: string;
  filename: string;
  objectsCount: number;
  priority: 'High' | 'Medium' | 'Low' | 'None';
  timestamp: string;
  timeShort: string;
  size: string;
  location: string;
  frequency: string;
  swath: string;
  speed: string;
  timeHud: string;
  thumb: string;
  sonarImg: string;
  detections: BatchDetectionObject[];
}

export interface BatchSummaryStats {
  totalImages: number;
  imagesWithDets: number;
  imagesWithDetsPercent: number;
  imagesWithoutDets: number;
  totalObjects: number;
  highPriority: number;
  highPriorityPercent: number;
  medPriority: number;
  medPriorityPercent: number;
  lowPriority: number;
  lowPriorityPercent: number;
}
