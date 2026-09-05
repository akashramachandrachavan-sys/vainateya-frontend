import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  FolderKanban,
  Map as MapIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  X,
  FileSpreadsheet,
  RotateCw,
  Check,
  Calendar,
  MapPin,
  Search,
  Bell,
  ChevronDown,
  Clock,
  Crosshair,
  Info,
  Grid,
  List,
  StopCircle,
  Printer,
  Activity,
  Image as ImageIcon,
  Folder,
  BarChart3,
  FilePlus2,
  Locate,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Database,
  HelpCircle,
  Code,
  Waves,
  MoreHorizontal,
  AlertCircle,
  Target,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Tag
} from 'lucide-react';

import {
  apiService,
  type ApiSurvey,
  type ApiSonarFile,
  type ApiDetection,
  type SystemMetrics,
} from '../../services/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'alert' | 'success' | 'info';
}

export type DashboardScreen = 'dashboard' | 'new-survey' | 'surveys' | 'map' | 'reports' | 'settings';

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

export const NaadvedhDashboard: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [newSurveyStep, setNewSurveyStep] = useState<1 | 2 | 3 | 4>(1);

  // Live Backend State
  const [backendSurveys, setBackendSurveys] = useState<ApiSurvey[]>([]);
  const [backendMetrics, setBackendMetrics] = useState<SystemMetrics | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<string>('');
  const [activeSurveyFiles, setActiveSurveyFiles] = useState<ApiSonarFile[]>([]);
  const [activeDetections, setActiveDetections] = useState<ApiDetection[]>([]);
  const [uploadedRawFiles, setUploadedRawFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 4 Batch Results State
  const [selectedBatchImageId, setSelectedBatchImageId] = useState<string>('');
  const [batchFilterTab, setBatchFilterTab] = useState<'all' | 'detections' | 'no_detections'>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');
  const [batchSortBy, setBatchSortBy] = useState<'priority' | 'time' | 'objects'>('priority');
  const [batchSelectedImageIds, setBatchSelectedImageIds] = useState<string[]>([]);
  const [batchImageDisplayMode, setBatchImageDisplayMode] = useState<'detected' | 'original'>('detected');
  const [batchZoomLevel, setBatchZoomLevel] = useState<number>(100);
  const [selectedDetectionCardId, setSelectedDetectionCardId] = useState<string>('');
  const [batchPaginationPage, setBatchPaginationPage] = useState<number>(1);
  const [detectionReviewMap, setDetectionReviewMap] = useState<
    Record<string, { status: 'confirmed' | 'rejected' | 'classified' | 'pending'; category?: string }>
  >({});
  const [isClassifyDropdownOpen, setIsClassifyDropdownOpen] = useState<boolean>(false);

  // Survey Details State
  const [surveyName, setSurveyName] = useState<string>('Arabian Sea Survey - Sept 2026');
  const [surveyLocation, setSurveyLocation] = useState<string>('Goa Coast, Arabian Sea');
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [surveyDescription, setSurveyDescription] = useState<string>(
    'Routine survey to detect potential marine debris in the designated area.'
  );

  // Files State
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileItem[]>([]);
  const [batchViewMode, setBatchViewMode] = useState<'grid' | 'list'>('grid');

  // Processing Screen State
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isProcessingComplete, setIsProcessingComplete] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSupportedFormatsModalOpen, setIsSupportedFormatsModalOpen] = useState<boolean>(false);

  // Map Screen state
  const [mapLayerMode, setMapLayerMode] = useState<'map' | 'satellite'>('satellite');
  const [selectedMapSurvey, setSelectedMapSurvey] = useState<string>('All Surveys');
  const [selectedMapDetectionId, setSelectedMapDetectionId] = useState<string>('');

  // Surveys Screen state
  const [surveyTabFilter, setSurveyTabFilter] = useState<'all' | 'completed' | 'processing' | 'high_priority' | 'archived'>('all');
  const [selectedCatalogSurveyId, setSelectedCatalogSurveyId] = useState<string>('');

  // Settings Screen state
  const [settingsTab, setSettingsTab] = useState<'profile' | 'preferences' | 'storage' | 'security' | 'notifications' | 'about'>('profile');
  const [profileFullName, setProfileFullName] = useState<string>('Akash Chavan');
  const [profileRole] = useState<string>('Marine Operator');
  const [profileEmail, setProfileEmail] = useState<string>('akash1@gmail.com');
  const [profileOrg, setProfileOrg] = useState<string>('VAINATEYA');
  const [profilePhone, setProfilePhone] = useState<string>('+91 98765 43210');
  const [profileTeam, setProfileTeam] = useState<string>('Marine Survey Team');
  const [profileLocation, setProfileLocation] = useState<string>('India');
  const [profileBio, setProfileBio] = useState<string>('Working towards cleaner oceans and safer coastlines through AI-powered marine survey analysis.');
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);

  // Map references
  const dashMapRef = useRef<HTMLDivElement | null>(null);
  const dashMapInstance = useRef<L.Map | null>(null);
  const fullMapRef = useRef<HTMLDivElement | null>(null);
  const fullMapInstance = useRef<L.Map | null>(null);
  const reportMapRef = useRef<HTMLDivElement | null>(null);
  const reportMapInstance = useRef<L.Map | null>(null);

  // Load real surveys, metrics, and detections from backend on mount
  const loadBackendData = async () => {
    try {
      const [surveys, metrics, dets] = await Promise.all([
        apiService.getSurveys().catch(() => []),
        apiService.getMetrics().catch(() => null),
        apiService.getDetections().catch(() => [])
      ]);
      setBackendSurveys(surveys);
      setBackendMetrics(metrics);
      setActiveDetections(dets);
      if (surveys.length > 0) {
        setActiveSurveyId(prev => prev || surveys[0].id);
        setSelectedCatalogSurveyId(prev => prev || surveys[0].id);
      }
    } catch (e) {
      console.error('Error fetching backend data:', e);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Fetch files and detections whenever activeSurveyId changes
  useEffect(() => {
    if (!activeSurveyId) return;
    const loadSurveyAssets = async () => {
      try {
        const [files, dets] = await Promise.all([
          apiService.getSurveyFiles(activeSurveyId).catch(() => []),
          apiService.getDetections(activeSurveyId).catch(() => [])
        ]);
        setActiveSurveyFiles(files);
        if (files.length > 0) {
          setSelectedBatchImageId(prev => prev || files[0].id);
        }
        if (dets.length > 0) {
          setActiveDetections(dets);
          setSelectedDetectionCardId(prev => prev || dets[0].id);
        }
      } catch (err) {
        console.error('Failed to load survey files/detections:', err);
      }
    };
    loadSurveyAssets();
  }, [activeSurveyId]);

  // Derived Survey Catalog Data from Backend
  const surveyCatalogData: SurveyCatalogItem[] = backendSurveys.map((srv, idx) => ({
    id: srv.id,
    number: srv.code || `#${idx + 1}`,
    name: srv.name,
    date: new Date(srv.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
    fullDate: new Date(srv.created_at).toLocaleString(),
    location: srv.location_name,
    images: srv.file_count || 1,
    detections: srv.detection_count || 0,
    status: (srv.status === 'ANALYZED' || srv.status === 'COMPLETED' ? 'Completed' : srv.status === 'PROCESSING' ? 'Processing' : 'Ready') as any,
    description: srv.description || 'Survey transect scanning for marine debris and seabed anomalies.',
    verifiedCount: srv.confirmed_count || 0,
    unclassifiedCount: Math.max(0, (srv.detection_count || 0) - (srv.confirmed_count || 0)),
  }));

  const selectedCatalogSurvey: SurveyCatalogItem = surveyCatalogData.find(s => s.id === selectedCatalogSurveyId) || surveyCatalogData[0] || {
    id: 'empty',
    number: '#0',
    name: 'No Surveys Found',
    date: 'N/A',
    fullDate: 'N/A',
    location: 'N/A',
    images: 0,
    detections: 0,
    status: 'Ready' as const,
    description: 'No surveys registered yet. Create a survey to begin scanning.',
    verifiedCount: 0,
    unclassifiedCount: 0,
  };

  // Derived Map Detections from Backend
  const detailedDetections: MapDetection[] = activeDetections.map((d, idx) => {
    const isVerified = d.status === 'CONFIRMED';
    const cat: 'Pipeline' | 'Anomaly' | 'Fishing Gear' | 'Debris' =
      d.class_name === 'pipe' ? 'Pipeline' :
        d.class_name === 'fishing_gear' ? 'Fishing Gear' :
          d.class_name === 'container' || d.class_name === 'shipwreck_debris' ? 'Debris' : 'Anomaly';

    const color = isVerified ? '#10b981' : d.priority === 'CRITICAL' || d.priority === 'HIGH' ? '#ef4444' : '#3b82f6';
    const markerType: 'green' | 'red' | 'blue' | 'yellow' = isVerified ? 'green' : d.priority === 'HIGH' || d.priority === 'CRITICAL' ? 'red' : 'blue';

    return {
      id: d.id,
      number: d.code || `#${idx + 1}`,
      name: d.label || d.class_name,
      confidence: Math.round(d.confidence > 1 ? d.confidence : d.confidence * 100),
      lat: `${d.location.latitude.toFixed(4)}°`,
      lng: `${d.location.longitude.toFixed(4)}°`,
      rawLat: d.location.latitude,
      rawLng: d.location.longitude,
      status: isVerified ? 'Verified' : 'Unverified',
      category: cat,
      color,
      markerType,
      thumb: '/sonar-tile-1.jpg',
    };
  });

  // Derived DetectionItem list
  const detections: DetectionItem[] = activeDetections.map(d => ({
    id: d.code || d.id,
    type: (d.class_name === 'fishing_gear' ? 'Fishing Gear' : d.class_name === 'container' ? 'Debris' : 'Unknown') as any,
    confidence: Math.round(d.confidence > 1 ? d.confidence : d.confidence * 100),
    lat: `${d.location.latitude.toFixed(4)}° N`,
    lng: `${d.location.longitude.toFixed(4)}° E`,
    color: d.priority === 'CRITICAL' || d.priority === 'HIGH' ? '#ef4444' : '#3b82f6',
    status: d.status === 'CONFIRMED' ? 'Confirmed' : d.status === 'REJECTED' ? 'Rejected' : 'Pending Review',
    operatorNote: d.notes || undefined,
    shadowLengthMeters: d.dimensions?.acoustic_shadow_length_m || 4.5,
    estimatedHeightMeters: d.dimensions?.estimated_length_m ? Number((d.dimensions.estimated_length_m * 0.3).toFixed(1)) : 1.2,
  }));

  // Derived Batch Images from active survey files & detections
  const allBatchSurveyImages: BatchImageResult[] = (activeSurveyFiles.length > 0
    ? activeSurveyFiles
    : [{
      id: 'default-file',
      survey_id: activeSurveyId || 'default',
      filename: 'transect_sss_line_01.png',
      file_size_bytes: 1802049,
      mime_type: 'image/png',
      width: 1200,
      height: 700,
      range_meters: 75,
      frequency_khz: 455,
      status: 'PROCESSED',
      created_at: new Date().toISOString(),
      url: '/sonar-tile-1.jpg'
    }]
  ).map((file, fIdx) => {
    const fileDetections = activeDetections.filter(
      d => d.file_id === file.id || (!d.file_id && fIdx === 0)
    );

    const mappedDetections: BatchDetectionObject[] = fileDetections.map((d, dIdx) => {
      const isCritical = d.priority === 'CRITICAL' || d.priority === 'HIGH';
      const isBlue = d.class_name === 'fishing_gear';
      const color: 'red' | 'blue' | 'amber' = isCritical ? 'red' : isBlue ? 'blue' : 'amber';
      const hexColor = isCritical ? '#ef4444' : isBlue ? '#3b82f6' : '#f59e0b';
      const borderColor = isCritical ? 'border-rose-500' : isBlue ? 'border-blue-500' : 'border-amber-500';
      const bgColor = isCritical ? 'bg-rose-500/10' : isBlue ? 'bg-blue-500/10' : 'bg-amber-500/10';
      const textColor = isCritical ? 'text-rose-600' : isBlue ? 'text-blue-600' : 'text-amber-600';
      const tagColor = isCritical ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : 'bg-amber-500';
      const badgeBg = isCritical
        ? 'bg-rose-50 text-rose-600 border border-rose-200'
        : isBlue
          ? 'bg-blue-50 text-blue-600 border border-blue-200'
          : 'bg-amber-50 text-amber-600 border border-amber-200';

      const imgW = file.width || 1200;
      const imgH = file.height || 700;

      return {
        id: d.id,
        orderNumber: dIdx + 1,
        name: d.label || d.class_name,
        type: d.class_name,
        confidence: Math.round(d.confidence > 1 ? d.confidence : d.confidence * 100),
        coordinates: `${d.location.latitude.toFixed(4)}° N, ${d.location.longitude.toFixed(4)}° E`,
        size: d.dimensions
          ? `${d.dimensions.estimated_length_m || 5.0} × ${d.dimensions.estimated_width_m || 2.0}`
          : '5.0 × 2.0',
        color,
        hexColor,
        borderColor,
        bgColor,
        textColor,
        tagColor,
        badgeBg,
        bbox: {
          left: `${Math.round((d.bbox.x / imgW) * 100)}%`,
          top: `${Math.round((d.bbox.y / imgH) * 100)}%`,
          width: `${Math.round((d.bbox.width / imgW) * 100)}%`,
          height: `${Math.round((d.bbox.height / imgH) * 100)}%`,
        },
        thumb: file.url || '/sonar-tile-1.jpg',
      };
    });

    const hasHigh = fileDetections.some(d => d.priority === 'CRITICAL' || d.priority === 'HIGH');
    const hasMed = fileDetections.some(d => d.priority === 'MEDIUM');
    const priority: 'High' | 'Medium' | 'Low' | 'None' = hasHigh
      ? 'High'
      : hasMed
        ? 'Medium'
        : fileDetections.length > 0
          ? 'Low'
          : 'None';

    return {
      id: file.id || file.filename,
      filename: file.filename,
      objectsCount: fileDetections.length,
      priority,
      timestamp: file.created_at ? new Date(file.created_at).toLocaleString() : 'Recent',
      timeShort: file.created_at ? new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM',
      size: `${(file.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
      location: 'Arabian Sea Shelf',
      frequency: `${file.frequency_khz || 455}kHz`,
      swath: `${file.range_meters || 75}m`,
      speed: '3kts',
      timeHud: file.created_at ? new Date(file.created_at).toLocaleTimeString() : '12:08:14',
      thumb: file.url || '/sonar-tile-1.jpg',
      sonarImg: file.url || '/sonar-tile-1.jpg',
      detections: mappedDetections,
    };
  });

  // Timer for live processing simulation
  useEffect(() => {
    let timer: number | undefined;
    if (currentScreen === 'new-survey' && newSurveyStep === 3 && !isProcessingComplete) {
      timer = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [currentScreen, newSurveyStep, isProcessingComplete]);

  // Handle step 3 automated progress
  useEffect(() => {
    if (currentScreen === 'new-survey' && newSurveyStep === 3) {
      const t1 = setTimeout(() => {
        setProcessingProgress(82);
        setActiveStage(4);
      }, 2500);

      const t2 = setTimeout(() => {
        setProcessingProgress(100);
        setActiveStage(5);
        setIsProcessingComplete(true);
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      }, 4500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [currentScreen, newSurveyStep]);

  // Initialize Dashboard Mini Map (West Coast Arabian Sea / Maharashtra / Goa)
  useEffect(() => {
    if (currentScreen !== 'dashboard') {
      if (dashMapInstance.current) {
        dashMapInstance.current.remove();
        dashMapInstance.current = null;
      }
      return;
    }

    if (!dashMapRef.current) return;

    const map = L.map(dashMapRef.current, {
      center: [16.4, 72.8],
      zoom: 7,
      zoomControl: false,
    });

    // High-definition satellite ocean basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    }).addTo(map);

    // Coastline place names & bathymetric boundaries overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    const surveyPoints: [number, number, string][] = [
      [17.4, 72.1, 'Arabian Sea Survey - 24 images'],
      [16.8, 72.8, 'Ratnagiri Deep Shelf'],
      [15.8, 73.1, 'Goa Patch North'],
    ];

    surveyPoints.forEach(([lat, lng, name]) => {
      const icon = L.divIcon({
        className: 'survey-marker-blue',
        html: `
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([lat, lng], { icon }).bindPopup(`<b>${name}</b><br/>Status: Completed`).addTo(map);
    });

    const highPriorityPoints: [number, number, string][] = [
      [16.9, 72.5, 'Target DET-001 (Ghost Net)'],
      [15.6, 73.4, 'Target DET-002 (Sunken Container)'],
    ];

    highPriorityPoints.forEach(([lat, lng, label]) => {
      const icon = L.divIcon({
        className: 'priority-marker-red',
        html: `
          <div style="position: relative; width: 20px; height: 20px; display: flex; items-center: justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #ef4444; opacity: 0.4; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4); margin: auto;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([lat, lng], { icon }).bindPopup(`<b>${label}</b><br/>Status: High Priority Action Required`).addTo(map);
    });

    dashMapInstance.current = map;

    return () => {
      if (dashMapInstance.current) {
        dashMapInstance.current.remove();
        dashMapInstance.current = null;
      }
    };
  }, [currentScreen]);

  // Initialize Detection Map (Full Map Screen)
  useEffect(() => {
    if (currentScreen !== 'map') {
      if (fullMapInstance.current) {
        fullMapInstance.current.remove();
        fullMapInstance.current = null;
      }
      return;
    }

    if (!fullMapRef.current) return;

    if (fullMapInstance.current) {
      fullMapInstance.current.remove();
      fullMapInstance.current = null;
    }

    const map = L.map(fullMapRef.current, {
      center: [17.1, 72.8],
      zoom: 7,
      zoomControl: false,
    });

    if (mapLayerMode === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar',
        maxZoom: 18,
      }).addTo(map);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
    }

    const detMarkers = [
      { lat: 17.4, lng: 72.4, label: '#1 Pipeline/Pipe', color: '#10b981', id: 'det-1' },
      { lat: 17.8, lng: 72.7, label: '#2 Unknown Anomaly', color: '#ef4444', id: 'det-2' },
      { lat: 16.2, lng: 73.1, label: '#3 Fishing Gear', color: '#3b82f6', id: 'det-3' },
      { lat: 17.1, lng: 72.8, label: '', color: '#10b981', id: 'det-4' },
      { lat: 15.8, lng: 73.3, label: '', color: '#10b981', id: 'det-5' },
      { lat: 16.6, lng: 72.9, label: '', color: '#f59e0b', id: 'det-extra' },
    ];

    detMarkers.forEach((m) => {
      const html = m.label
        ? `
          <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${m.color}; border: 2.5px solid white; box-shadow: 0 0 10px ${m.color}90; flex-shrink: 0;"></div>
            <div style="background: rgba(0, 0, 0, 0.75); color: #ffffff; font-family: monospace; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${m.label}</div>
          </div>
        `
        : `
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${m.color}; border: 2px solid white; box-shadow: 0 0 8px ${m.color}80; cursor: pointer;"></div>
        `;

      const icon = L.divIcon({
        className: 'custom-sonar-det',
        html,
        iconSize: m.label ? [140, 20] : [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([m.lat, m.lng], { icon })
        .on('click', () => {
          setSelectedMapDetectionId(m.id);
        })
        .addTo(map);
    });

    fullMapInstance.current = map;

    return () => {
      if (fullMapInstance.current) {
        fullMapInstance.current.remove();
        fullMapInstance.current = null;
      }
    };
  }, [currentScreen, mapLayerMode]);

  // Initialize Report Screen mini-map
  useEffect(() => {
    if (currentScreen !== 'reports') {
      if (reportMapInstance.current) {
        reportMapInstance.current.remove();
        reportMapInstance.current = null;
      }
      return;
    }

    if (!reportMapRef.current) return;

    if (reportMapInstance.current) {
      reportMapInstance.current.remove();
      reportMapInstance.current = null;
    }

    const map = L.map(reportMapRef.current, {
      center: [16.8, 72.8],
      zoom: 6,
      zoomControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    const reportPoints: [number, number, string, string][] = [
      [17.4, 72.4, 'Pipeline/Pipe', '#10b981'],
      [17.8, 72.7, 'Unknown Anomaly', '#ef4444'],
      [16.2, 73.1, 'Possible Fishing Gear', '#3b82f6'],
      [16.9, 72.9, 'Unverified Target', '#f59e0b'],
      [15.8, 73.3, 'Debris/Container', '#10b981'],
    ];

    reportPoints.forEach(([lat, lng, name, color]) => {
      const icon = L.divIcon({
        className: 'report-map-dot',
        html: `<div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; border: 1.5px solid white; box-shadow: 0 0 6px ${color};"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker([lat, lng], { icon }).bindPopup(`<b>${name}</b>`).addTo(map);
    });

    reportMapInstance.current = map;

    return () => {
      if (reportMapInstance.current) {
        reportMapInstance.current.remove();
        reportMapInstance.current = null;
      }
    };
  }, [currentScreen]);

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedRawFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const filesArr = Array.from(e.target.files);
    setUploadedRawFiles(prev => [...prev, ...filesArr]);
    const mapped: UploadedFileItem[] = filesArr.map(f => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      thumbnail: URL.createObjectURL(f),
      rawFile: f,
    }));
    setSelectedFiles(prev => [...prev, ...mapped]);
  };

  const handleCreateSurveyStep1 = async () => {
    try {
      const created = await apiService.createSurvey({
        name: surveyName,
        location_name: surveyLocation,
        description: surveyDescription,
        operator: profileOrg,
        sonar_device: 'Side-Scan Sonar'
      });
      setActiveSurveyId(created.id);
      setSelectedCatalogSurveyId(created.id);
      setBackendSurveys(prev => [created, ...prev.filter(s => s.id !== created.id)]);
      setNewSurveyStep(2);
    } catch (err) {
      console.warn('Backend create survey error:', err);
      setNewSurveyStep(2);
    }
  };

  const handleStartProcessingStep2 = async () => {
    setNewSurveyStep(3);
    setProcessingProgress(20);
    setActiveStage(1);
    setIsProcessingComplete(false);

    try {
      // 1. Upload files to backend if user selected files
      if (activeSurveyId && uploadedRawFiles.length > 0) {
        for (const file of uploadedRawFiles) {
          await apiService.uploadSonarFile(activeSurveyId, file).catch(err => console.warn('File upload warning:', err));
        }
      }
      setProcessingProgress(50);
      setActiveStage(3);

      // 2. Trigger AI detection model inference
      if (activeSurveyId) {
        await apiService.triggerAnalysis(activeSurveyId).catch(err => console.warn('Inference trigger warning:', err));
      }

      setProcessingProgress(85);
      setActiveStage(4);

      // 3. Refresh survey files and detections
      if (activeSurveyId) {
        const [files, dets] = await Promise.all([
          apiService.getSurveyFiles(activeSurveyId).catch(() => []),
          apiService.getDetections(activeSurveyId).catch(() => [])
        ]);
        setActiveSurveyFiles(files);
        if (files.length > 0) {
          setSelectedBatchImageId(files[0].id);
        }
        if (dets.length > 0) {
          setActiveDetections(dets);
          setSelectedDetectionCardId(dets[0].id);
        }
      }

      setProcessingProgress(100);
      setActiveStage(5);
      setIsProcessingComplete(true);
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Processing error:', err);
      setProcessingProgress(100);
      setIsProcessingComplete(true);
    }
  };

  const handleOperatorVerify = async (
    detectionId: string,
    status: 'CONFIRMED' | 'REJECTED',
    categoryNote?: string
  ) => {
    setDetectionReviewMap(prev => ({
      ...prev,
      [detectionId]: {
        status: status === 'CONFIRMED' ? (categoryNote ? 'classified' : 'confirmed') : 'rejected',
        category: categoryNote || prev[detectionId]?.category,
      },
    }));

    try {
      await apiService.verifyDetection(detectionId, {
        status,
        notes: categoryNote
          ? `Operator classified: ${categoryNote}`
          : status === 'CONFIRMED'
            ? 'Confirmed real debris by operator'
            : 'Rejected false alarm by operator',
        verified_by: profileFullName || 'Marine Operator',
      });
      apiService.getMetrics().then(m => setBackendMetrics(m)).catch(() => { });
    } catch (err) {
      console.warn('Operator verify API warning:', err);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Survey Name', surveyName],
      ['Survey Location', surveyLocation],
      ['Date', surveyDate],
      [],
      ['Detection ID', 'Type', 'Confidence (%)', 'Latitude', 'Longitude', 'Status', 'Shadow Length (m)', 'Height (m)'],
      ...detections.map(d => [
        d.id,
        d.type,
        d.confidence,
        d.lat,
        d.lng,
        d.status,
        d.shadowLengthMeters,
        d.estimatedHeightMeters
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VAINATEYA_Survey_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Minimalist White Sidebar (Narrower by ~10px for more workspace) */}
      <aside className="w-52 sm:w-[228px] bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between shrink-0 select-none z-30">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-3.5 sm:p-4 flex items-center space-x-2.5 border-b border-slate-100">
            <img
              src="/vainateya-symbol.png"
              alt="VAINATEYA Logo"
              className="w-7 h-7 object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Space_Grotesk'] tracking-wider leading-none">
                VAINATEYA
              </h1>
              <p className="text-[9px] text-blue-600 font-mono tracking-tight mt-0.5 truncate italic font-medium">
                When human vision ends, perception continues.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-0.5 text-xs font-medium">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'dashboard'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setCurrentScreen('new-survey');
                setNewSurveyStep(1);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'new-survey'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <FilePlus2 className="w-4 h-4" />
              <span>New Survey</span>
            </button>

            <button
              onClick={() => setCurrentScreen('surveys')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'surveys'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Folder className="w-4 h-4" />
              <span>Surveys</span>
            </button>

            <button
              onClick={() => setCurrentScreen('map')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'map'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>

            <button
              onClick={() => setCurrentScreen('reports')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'reports'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setCurrentScreen('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'settings'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: User Info & Logout (Matching Reference Image) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div>
            <div className="text-xs font-bold text-slate-900">Akash Chavan</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              akash.ramachandra.chavan@gmail.com
            </div>
          </div>

          <a
            href="/auth.html?mode=signin"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </a>

          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              PROTECT OUR OCEANS
            </p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveys, locations, or detections..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Right Header: Notification Bell & Profile Avatar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Header */}
                    <div className="p-3 sm:p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Notifications
                        </span>
                        {notificationsList.filter(n => !n.read).length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
                            {notificationsList.filter(n => !n.read).length} new
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[10.5px]">
                        {notificationsList.length > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setNotificationsList(prev => prev.map(n => ({ ...n, read: true })))}
                              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                            >
                              Mark read
                            </button>
                            <span className="text-slate-300">&bull;</span>
                            <button
                              type="button"
                              onClick={() => setNotificationsList([])}
                              className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                            >
                              Clear all
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notificationsList.length > 0 ? (
                        notificationsList.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotificationsList(prev =>
                                prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                              );
                            }}
                            className={`p-3 transition-colors cursor-pointer flex items-start space-x-2.5 ${notif.read ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/30 hover:bg-blue-50/60'
                              }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notif.category === 'alert' && (
                                <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {notif.category === 'success' && (
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {notif.category === 'info' && (
                                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                                  <Info className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs truncate ${notif.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                                  {notif.title}
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-400 shrink-0">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>

                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 px-4 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <Bell className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">No notifications</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                            You're all caught up with your marine surveys and debris detection alerts.
                          </p>
                          <button
                            type="button"
                            onClick={loadBackendData}
                            className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 underline mt-1 cursor-pointer"
                          >
                            Sync with server
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 cursor-pointer group">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                A
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">Akash Chavan</div>
                <div className="text-[10px] font-mono text-slate-500 leading-tight">Marine Operator</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SCREEN 1: DASHBOARD OVERVIEW (Image 1) */}
        {/* ========================================================= */}
        {currentScreen === 'dashboard' && (
          <main className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 max-w-7xl mx-auto w-full">
            {/* Header Greeting & Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                  Welcome back, Akash!
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitor surveys, review detections, and contribute to cleaner oceans.
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                Tue, 23 Sep 2025
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Total Surveys */}
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Total Surveys</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] leading-tight">
                    {backendMetrics?.total_surveys ?? backendSurveys.length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">
                    Active: {backendSurveys.length}
                  </div>
                </div>
              </div>

              {/* 2. Total Detections */}
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Total Detections</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] leading-tight">
                    {backendMetrics?.total_detections ?? activeDetections.length}
                  </div>
                  <div className="text-[10px] font-bold text-purple-600">
                    {activeDetections.length} in active survey
                  </div>
                </div>
              </div>

              {/* 3. High Priority */}
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">High Priority</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] leading-tight">
                    {backendMetrics?.high_priority_count ?? activeDetections.filter(d => d.priority === 'HIGH' || d.priority === 'CRITICAL').length}
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Requires action
                  </div>
                </div>
              </div>

              {/* 4. Processed */}
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Processed</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] leading-tight">
                    {backendMetrics?.confirmed_count ?? activeDetections.filter(d => d.status === 'CONFIRMED').length}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {backendMetrics?.verification_rate_percent !== undefined ? `${backendMetrics.verification_rate_percent}% verified` : 'Live verified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Survey Locations Map (Left) & Recent Surveys (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              {/* Left Column (7 cols): Survey Locations Map Card */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Survey Locations
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Overview of all survey areas and detected anomalies.
                    </p>
                  </div>

                  <button className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                    <span>All Surveys</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Map Viewport - Compact height to eliminate vertical scrolling */}
                <div className="relative w-full h-[185px] sm:h-[205px] rounded-lg overflow-hidden border border-slate-200">
                  <div ref={dashMapRef} className="w-full h-full z-0"></div>

                  {/* Top-Right Map Controls */}
                  <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1 bg-white rounded border border-slate-200 shadow-sm p-0.5">
                    <button
                      onClick={() => dashMapInstance.current?.zoomIn()}
                      className="p-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      onClick={() => dashMapInstance.current?.zoomOut()}
                      className="p-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      &minus;
                    </button>
                    <button
                      onClick={() => dashMapInstance.current?.setView([16.4, 72.8], 7)}
                      className="p-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Center Map"
                    >
                      <Locate className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Geographic Watermarks on Map */}
                  <div className="absolute top-1/2 left-6 -translate-y-1/2 text-white/50 font-['Space_Grotesk'] font-bold text-xs tracking-widest italic pointer-events-none drop-shadow-sm select-none">
                    Arabian Sea
                  </div>
                  <div className="absolute top-1/4 right-6 text-white/70 font-semibold text-[11px] tracking-wider pointer-events-none drop-shadow-sm select-none">
                    Maharashtra
                  </div>
                  <div className="absolute bottom-1/4 right-8 text-white/70 font-semibold text-[11px] tracking-wider pointer-events-none drop-shadow-sm select-none">
                    Goa
                  </div>

                  {/* Bottom-Left Legend */}
                  <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded border border-slate-200 shadow-sm text-[10px] space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>Survey Location</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                      <span>High Priority Detection</span>
                    </div>
                  </div>

                  {/* Bottom-Right Scale Bar */}
                  <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-200 text-[9px] font-mono text-slate-600 shadow-sm">
                    100 km
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Recent Surveys */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                    Recent Surveys
                  </h2>
                  <button
                    onClick={() => setCurrentScreen('surveys')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 space-y-0.5">
                  {/* Survey 1 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(4);
                    }}
                    className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src="/sonar-tile-1.jpg"
                        alt="Arabian Sea Survey"
                        className="w-10 h-8 object-cover rounded-md border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Arabian Sea Survey
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          23 Sep 2025 &bull; 24 images
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">5 detections</div>
                    </div>
                  </div>

                  {/* Survey 2 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(3);
                    }}
                    className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src="/sonar-tile-2.jpg"
                        alt="Mumbai Coast Survey"
                        className="w-10 h-8 object-cover rounded-md border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Mumbai Coast Survey
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          20 Sep 2025 &bull; 18 images
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      Processing
                    </span>
                  </div>

                  {/* Survey 3 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(4);
                    }}
                    className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src="/sonar-tile-3.jpg"
                        alt="Goa Patch Survey"
                        className="w-10 h-8 object-cover rounded-md border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Goa Patch Survey
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          18 Sep 2025 &bull; 32 images
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">3 detections</div>
                    </div>
                  </div>

                  {/* Survey 4 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(1);
                    }}
                    className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src="/sonar-survey-sample.png"
                        alt="Ratnagiri Survey"
                        className="w-10 h-8 object-cover rounded-md border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Ratnagiri Survey
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          14 Sep 2025 &bull; 27 images
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Not Started
                    </span>
                  </div>
                </div>
              </div>
            </div>          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: NEW SURVEY (Images 2, 3, 4, 5) */}
        {/* ========================================================= */}
        {currentScreen === 'new-survey' && (
          <main className={`w-full mx-auto ${newSurveyStep === 4 ? 'px-3.5 py-2 space-y-2 max-w-[1600px]' : 'p-3.5 sm:p-4 lg:p-5 space-y-3 max-w-7xl'}`}>
            {/* Title & Subtitle + Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <div>
                <h1 className={`${newSurveyStep === 4 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-tight`}>
                  {newSurveyStep === 4 ? 'Survey Results' : 'New Survey'}
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {newSurveyStep === 4
                    ? 'Batch analysis completed. Review detected objects and explore results across all processed images.'
                    : 'Upload side-scan sonar imagery to detect and classify underwater debris and anomalies.'}
                </p>
              </div>

              {newSurveyStep === 4 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Processing Completed</span>
                      <span className="hidden sm:inline text-slate-400 mx-1.5">|</span>
                      <span className="block sm:inline text-[10px] font-mono text-emerald-700">100 / 100 images processed in 12 min 34 sec</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentScreen('reports')}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>View Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Results</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4-Step Stepper Header (Images 2, 3, 4) */}
            <div className={`flex items-center max-w-2xl text-[11px] font-mono font-bold ${newSurveyStep === 4 ? 'pt-0 pb-0' : 'pt-0 pb-1 text-xs'}`}>
              {/* Step 1 */}
              <div
                onClick={() => setNewSurveyStep(1)}
                className={`flex items-center space-x-1.5 cursor-pointer ${newSurveyStep >= 1 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 1
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </div>
                <span>Survey Details</span>
              </div>

              {/* Line 1-2 */}
              <div
                className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 2 */}
              <div
                onClick={() => setNewSurveyStep(2)}
                className={`flex items-center space-x-1.5 cursor-pointer ${newSurveyStep >= 2 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 2
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </div>
                <span>Upload Data</span>
              </div>

              {/* Line 2-3 */}
              <div
                className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 3 */}
              <div
                onClick={() => setNewSurveyStep(3)}
                className={`flex items-center space-x-1.5 cursor-pointer ${newSurveyStep >= 3 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 3
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 3
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                </div>
                <span>Processing</span>
              </div>

              {/* Line 3-4 */}
              <div
                className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 4 */}
              <div
                onClick={() => setNewSurveyStep(4)}
                className={`flex items-center space-x-1.5 cursor-pointer ${newSurveyStep === 4 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep === 4
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  4
                </div>
                <span>Results</span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: SURVEY DETAILS (Image 2) */}
            {/* ------------------------------------------------------------- */}
            {newSurveyStep === 1 && (
              <div className="space-y-3">
                {/* Survey Information Card */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Survey Information
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Provide basic details about the survey before uploading sonar data in the next step.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Survey Name */}
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Survey Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={surveyName}
                        onChange={e => setSurveyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    {/* Survey Date & Survey Area */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Survey Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={surveyDate}
                            onChange={e => setSurveyDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Survey Area / Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={surveyLocation}
                            onChange={e => setSurveyLocation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-7 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                          />
                          {surveyLocation && (
                            <button
                              onClick={() => setSurveyLocation('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                          Description (Optional)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {surveyDescription.length}/500
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={surveyDescription}
                        maxLength={500}
                        onChange={e => setSurveyDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Why these details note */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 flex items-start space-x-2 mt-2">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[11px] font-bold text-blue-900 leading-tight">Why these details?</h5>
                        <p className="text-[10.5px] text-blue-700/90 leading-normal mt-0.5">
                          Survey information helps in organizing data, mapping detections, and generating accurate reports. You will upload side-scan sonar data in the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Buttons Bar */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateSurveyStep1}
                    className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Next: Upload Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: UPLOAD DATA & BATCH PREVIEW (Image 3) */}
            {/* ------------------------------------------------------------- */}
            {newSurveyStep === 2 && (
              <div className="space-y-3">
                {/* Hidden File Input for Real File Uploads */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                  accept=".png,.jpg,.jpeg,.tif,.tiff,.bmp"
                  className="hidden"
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                  {/* Left Column (5 cols): Upload Box & Selected Files */}
                  <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Upload Side-Scan Sonar Data
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Select one or multiple sonar image files for analysis.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSupportedFormatsModalOpen(true)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors cursor-pointer"
                      >
                        <Info className="w-2.5 h-2.5 text-blue-600" />
                        <span>Formats</span>
                      </button>
                    </div>

                    {/* Dropzone */}
                    <div
                      onClick={handleAddFiles}
                      className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-3 text-center bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer space-y-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        Drag &amp; drop sonar images here
                      </div>
                      <div className="text-[10px] text-slate-400">or</div>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                      >
                        Browse Files
                      </button>
                      <p className="text-[9.5px] font-mono text-slate-400 pt-0.5">
                        PNG, JPEG, TIFF, BMP &bull; Up to 25 MB per file
                      </p>
                    </div>

                    {/* Selected Files List */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                          Selected Files ({selectedFiles.length})
                        </span>
                        {selectedFiles.length > 0 && (
                          <button
                            onClick={() => setSelectedFiles([])}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {selectedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate font-mono text-[11px]">
                                  {file.name}
                                </div>
                                <div className="text-[9.5px] text-slate-400 font-mono">
                                  {file.size}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (7 cols): Batch Preview */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Batch Preview
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            {selectedFiles.length} images selected
                          </p>
                        </div>

                        {/* View Mode Toggle: Grid View vs List View */}
                        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                          <button
                            onClick={() => setBatchViewMode('grid')}
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[11px] ${batchViewMode === 'grid'
                              ? 'bg-white text-blue-700 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            <Grid className="w-3 h-3" />
                            <span>Grid</span>
                          </button>
                          <button
                            onClick={() => setBatchViewMode('list')}
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[11px] ${batchViewMode === 'list'
                              ? 'bg-white text-blue-700 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            <List className="w-3 h-3" />
                            <span>List</span>
                          </button>
                        </div>
                      </div>

                      {/* Previews: 3x2 Grid */}
                      {batchViewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 group"
                            >
                              <div className="h-20 sm:h-22 w-full overflow-hidden relative">
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/60 text-white font-mono text-[8.5px]">
                                  {file.size}
                                </div>
                              </div>
                              <div className="p-1.5 bg-white border-t border-slate-100">
                                <div className="text-[10px] font-mono font-bold text-slate-800 truncate">
                                  {file.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2.5">
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                                <div>
                                  <div className="text-xs font-bold font-mono text-slate-900">
                                    {file.name}
                                  </div>
                                  <div className="text-[9.5px] text-slate-500 font-mono">
                                    {file.size} &bull; Ready
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips for best results */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 flex items-start space-x-2.5 mt-1">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <h5 className="text-[11px] font-bold text-blue-900">Tips for best results</h5>
                          <ul className="text-[10px] text-blue-800/80 space-y-0.5 list-disc pl-3.5">
                            <li>Use high-resolution side-scan sonar images (port-starboard oriented).</li>
                            <li>Supported: PNG, JPEG, TIFF, BMP &bull; Up to 25 MB per file.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => setNewSurveyStep(1)}
                        className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        onClick={handleStartProcessingStep2}
                        className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Start Processing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: PROCESSING SONAR IMAGES (Image 4) */}
            {/* ------------------------------------------------------------- */}
            {newSurveyStep === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                  {/* Left Column (7 cols): Pipeline Checklist & Progress */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Processing Sonar Images
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            Analyzing sonar data using AI to detect and classify underwater debris.
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedFiles.length || 5} images
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">
                            {isProcessingComplete
                              ? '5 of 5 images processed'
                              : '3 of 5 images processed'}
                          </span>
                          <span className="font-mono font-bold text-blue-600">
                            {processingProgress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* 5-Stage Checklist */}
                      <div className="space-y-1.5 pt-0.5">
                        {/* 1. Data Validation */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                1. Data Validation
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Checking file format, resolution, and integrity.
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            00:00:05
                          </span>
                        </div>

                        {/* 2. Image Preprocessing */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                2. Image Preprocessing
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Noise filtering, beam slant-range correction, and contrast boost.
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            00:00:18
                          </span>
                        </div>

                        {/* 3. AI Detection & Classification */}
                        <div className="p-2 rounded-lg bg-blue-50/40 border border-blue-200 flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            {isProcessingComplete || activeStage > 3 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <RotateCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-blue-900">
                                3. AI Detection &amp; Classification
                              </h4>
                              <p className="text-[10px] text-blue-700/80">
                                YOLOv12 acoustic bounding box and confidence score scoring.
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border shrink-0 ${isProcessingComplete || activeStage > 3
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                          >
                            {isProcessingComplete || activeStage > 3 ? '00:01:12' : 'Scanning...'}
                          </span>
                        </div>

                        {/* 4. Geospatial Localization */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            {isProcessingComplete || activeStage >= 4 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                4. Geospatial Localization
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Converting pixel positions to WGS84 geographic coordinates.
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {isProcessingComplete || activeStage >= 4 ? '00:00:20' : 'Pending'}
                          </span>
                        </div>

                        {/* 5. Generating Results */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            {isProcessingComplete || activeStage >= 5 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                5. Generating Results
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Compiling analysis results and shadow verification geometry.
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {isProcessingComplete || activeStage >= 5 ? '00:00:08' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Alert and Cancel */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 leading-tight">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Please keep this page open. Processing runs in high-priority GPU batch mode.
                        </span>
                      </div>

                      {isProcessingComplete ? (
                        <button
                          onClick={() => setNewSurveyStep(4)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>View Results</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setNewSurveyStep(2)}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column (5 cols): Current Image Scanning & Live Statistics */}
                  <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Current Image
                        </h2>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {isProcessingComplete ? '5 / 5' : '3 / 5'}
                        </span>
                      </div>

                      {/* Active Sonar Waterfall Box with Scanning Laser HUD */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black aspect-16/10 max-h-40">
                        <img
                          src="/sonar-tile-3.jpg"
                          alt="Current active sonar frame"
                          className="w-full h-full object-cover opacity-90"
                        />

                        {/* Animated Scanning Laser HUD Line */}
                        {!isProcessingComplete && (
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse"></div>
                        )}

                        {/* Top HUD badge */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/70 text-cyan-400 font-mono text-[9px] border border-cyan-500/30 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                          <span>YOLOv12 SSS</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                        <span className="font-bold text-slate-800">sonar_003.tif</span>
                        <span className="text-blue-600 font-bold">
                          {isProcessingComplete ? 'Complete' : 'Processing...'}
                        </span>
                      </div>
                    </div>

                    {/* Live Statistics */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <h4 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                        Live Statistics
                      </h4>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-1.5">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px]">Images Processed</span>
                          </span>
                          <span className="font-bold font-mono text-slate-900 text-xs">
                            {isProcessingComplete ? '5 / 5' : '3 / 5'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-1.5">
                            <Crosshair className="w-3 h-3 text-purple-600" />
                            <span className="text-[11px]">Potential Detections</span>
                          </span>
                          <span className="font-bold font-mono text-purple-600 text-xs">12</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-1.5">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span className="text-[11px]">Elapsed Time</span>
                          </span>
                          <span className="font-bold font-mono text-slate-900 text-xs">
                            {Math.floor(elapsedSeconds / 60)
                              .toString()
                              .padStart(2, '0')}
                            :{(elapsedSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-slate-500 flex items-center space-x-1.5">
                            <Activity className="w-3 h-3 text-emerald-600" />
                            <span className="text-[11px]">Processing Speed</span>
                          </span>
                          <span className="font-bold font-mono text-emerald-600 text-xs">
                            ~ 6.2 sec/img
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: RESULTS / ANALYSIS STUDIO (Image 5 Minimalist Style) */}
            {/* ------------------------------------------------------------- */}
            {/* ------------------------------------------------------------- */}
            {/* STEP 4: BATCH SURVEY RESULTS STUDIO (Matching Image 1)         */}
            {/* ------------------------------------------------------------- */}
            {newSurveyStep === 4 && (() => {
              // Helper calculations for Batch Results
              const filteredBatchImages = allBatchSurveyImages
                .filter(img => {
                  if (batchFilterTab === 'detections') return img.objectsCount > 0;
                  if (batchFilterTab === 'no_detections') return img.objectsCount === 0;
                  return true;
                })
                .filter(img =>
                  img.filename.toLowerCase().includes(batchSearchQuery.toLowerCase())
                )
                .sort((a, b) => {
                  if (batchSortBy === 'priority') {
                    const priorityRank = { High: 3, Medium: 2, Low: 1, None: 0 };
                    return priorityRank[b.priority] - priorityRank[a.priority];
                  }
                  if (batchSortBy === 'objects') {
                    return b.objectsCount - a.objectsCount;
                  }
                  return a.filename.localeCompare(b.filename);
                });

              const itemsPerPage = 5;
              const totalPages = Math.max(1, Math.ceil(filteredBatchImages.length / itemsPerPage));
              const currentPage = Math.min(batchPaginationPage, totalPages);
              const paginatedImages = filteredBatchImages.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );

              const currentBatchImage =
                allBatchSurveyImages.find(img => img.id === selectedBatchImageId) ||
                allBatchSurveyImages[0];

              const activeDetection =
                currentBatchImage.detections.find((d: BatchDetectionObject) => d.id === selectedDetectionCardId) ||
                currentBatchImage.detections[0];

              const activeReview = activeDetection
                ? (detectionReviewMap[activeDetection.id] || { status: 'pending', category: activeDetection.type })
                : null;

              const currentIndex = filteredBatchImages.findIndex(img => img.id === currentBatchImage.id);

              const handlePrevImage = () => {
                if (currentIndex > 0) {
                  const prevImg = filteredBatchImages[currentIndex - 1];
                  setSelectedBatchImageId(prevImg.id);
                  if (prevImg.detections.length > 0) {
                    setSelectedDetectionCardId(prevImg.detections[0].id);
                  }
                }
              };

              const handleNextImage = () => {
                if (currentIndex < filteredBatchImages.length - 1) {
                  const nextImg = filteredBatchImages[currentIndex + 1];
                  setSelectedBatchImageId(nextImg.id);
                  if (nextImg.detections.length > 0) {
                    setSelectedDetectionCardId(nextImg.detections[0].id);
                  }
                }
              };

              const toggleImageSelect = (id: string, e: React.MouseEvent) => {
                e.stopPropagation();
                setBatchSelectedImageIds(prev =>
                  prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
                );
              };

              return (
                <div className="space-y-2.5">
                  {/* ========================================================= */}
                  {/* 1. TOP SUMMARY KPI CARDS (6 Compact Cards matching Image 1)*/}
                  {/* ========================================================= */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {/* Card 1: Total Images Processed */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          100
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          Total Images Processed
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Images with Detections */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          10
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          Images with Detections (10%)
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Total Objects Detected */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Crosshair className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          28
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          Total Objects Detected
                        </p>
                      </div>
                    </div>

                    {/* Card 4: High Priority Objects */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          5
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          High Priority Objects
                        </p>
                      </div>
                    </div>

                    {/* Card 5: Medium Priority Objects */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          12
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          Medium Priority Objects
                        </p>
                      </div>
                    </div>

                    {/* Card 6: Low Priority Objects */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
                          11
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          Low Priority Objects
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 2. MAIN 3-COLUMN STUDIO SECTION (Aligned Heights)         */}
                  {/* ========================================================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
                    {/* ------------------------------------------------------- */}
                    {/* LEFT COLUMN: Images List (5 items per page) (lg:col-span-3) */}
                    {/* ------------------------------------------------------- */}
                    <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        {/* Header with Title & Options */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Images ({allBatchSurveyImages.length})
                          </h3>
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Options"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Filter Tabs: All / Detections / No Detections */}
                        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[10.5px] font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setBatchFilterTab('all');
                              setBatchPaginationPage(1);
                            }}
                            className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'all'
                              ? 'bg-white text-blue-600 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            All (100)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBatchFilterTab('detections');
                              setBatchPaginationPage(1);
                            }}
                            className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'detections'
                              ? 'bg-white text-blue-600 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            Detections (10)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBatchFilterTab('no_detections');
                              setBatchPaginationPage(1);
                            }}
                            className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'no_detections'
                              ? 'bg-white text-blue-600 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            No Detections (90)
                          </button>
                        </div>

                        {/* Search Bar & Sort Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search images..."
                              value={batchSearchQuery}
                              onChange={e => {
                                setBatchSearchQuery(e.target.value);
                                setBatchPaginationPage(1);
                              }}
                              className="w-full pl-7 pr-2 py-1 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 bg-slate-50/50"
                            />
                          </div>

                          <div className="relative">
                            <select
                              value={batchSortBy}
                              onChange={e => setBatchSortBy(e.target.value as any)}
                              className="appearance-none pl-2 pr-5 py-1 rounded-lg border border-slate-200 text-[10.5px] font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="priority">Sort: Priority</option>
                              <option value="objects">Sort: Objects</option>
                              <option value="time">Sort: Name</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Image Items List (5 items max per page) */}
                        <div className="space-y-1">
                          {paginatedImages.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                              No images match your filter.
                            </div>
                          ) : (
                            paginatedImages.map(item => {
                              const isSelected = selectedBatchImageId === item.id;
                              const isChecked = batchSelectedImageIds.includes(item.id);

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedBatchImageId(item.id);
                                    if (item.detections.length > 0) {
                                      setSelectedDetectionCardId(item.detections[0].id);
                                    }
                                  }}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer border ${isSelected
                                    ? 'border-rose-400 bg-rose-50/40 shadow-2xs ring-1 ring-rose-300'
                                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                                    }`}
                                >
                                  {/* Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={e => toggleImageSelect(item.id, e as any)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />

                                  {/* Thumbnail */}
                                  <div className="w-10 h-8 rounded overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                                    <img
                                      src={item.thumb}
                                      alt={item.filename}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Content Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[11.5px] truncate ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                                        {item.filename}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-0.5">
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {item.objectsCount > 0 ? `${item.objectsCount} objects` : '0 objects'}
                                      </span>

                                      {item.priority === 'High' && (
                                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100/80 text-rose-700 border border-rose-200/80">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                          <span>High</span>
                                        </span>
                                      )}
                                      {item.priority === 'Medium' && (
                                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                          <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                                          <span>Medium</span>
                                        </span>
                                      )}
                                      {item.priority === 'Low' && (
                                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                          <span>Low</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Timestamp */}
                                    {item.timeShort && (
                                      <div className="text-[9px] text-slate-400 font-mono text-right">
                                        {item.timeShort}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Dynamic Pagination Controls */}
                      <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setBatchPaginationPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>

                        {totalPages <= 4 ? (
                          Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setBatchPaginationPage(pageNum)}
                              className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === pageNum
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {pageNum}
                            </button>
                          ))
                        ) : (
                          <>
                            {[1, 2, 3].map(pageNum => (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setBatchPaginationPage(pageNum)}
                                className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === pageNum
                                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            ))}
                            <span className="text-slate-400 px-0.5 text-xs">...</span>
                            <button
                              type="button"
                              onClick={() => setBatchPaginationPage(totalPages)}
                              className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === totalPages
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setBatchPaginationPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* ------------------------------------------------------- */}
                    {/* CENTER COLUMN: Sonar Canvas + Verification Actions      */}
                    {/* ------------------------------------------------------- */}
                    <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        {/* Top Action & Navigation Row */}
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                              {currentBatchImage.filename}
                            </h3>
                            {currentBatchImage.priority === 'High' && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>High Priority</span>
                              </span>
                            )}
                            {currentBatchImage.priority === 'Medium' && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span>Medium Priority</span>
                              </span>
                            )}
                            {currentBatchImage.priority === 'Low' && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span>Low Priority</span>
                              </span>
                            )}
                          </div>

                          {/* Prev / Next Nav Buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={handlePrevImage}
                              disabled={currentIndex <= 0}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>Previous</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextImage}
                              disabled={currentIndex >= filteredBatchImages.length - 1}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Image Sub-Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2.5 text-slate-500 text-[10.5px]">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{currentBatchImage.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="w-3 h-3 text-slate-400" />
                            <span>{currentBatchImage.size}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{currentBatchImage.location}</span>
                          </div>
                        </div>

                        {/* Main Sonar Viewport Canvas with Controlled Height */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-900 bg-slate-950 w-full h-[195px] sm:h-[210px] shadow-inner select-none">
                          <img
                            src={currentBatchImage.sonarImg}
                            alt="Side-Scan Sonar Analysis"
                            className="w-full h-full object-cover select-none transition-transform duration-200"
                            style={{
                              transform: `scale(${batchZoomLevel / 100})`,
                            }}
                          />

                          {/* Depth Gauge on Left Side (0m, 10m, 20m, 30m, 40m) */}
                          <div className="absolute left-1.5 top-1.5 bottom-1.5 flex flex-col justify-between text-[9px] font-mono font-bold text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none z-10">
                            <span>0m</span>
                            <span>10m</span>
                            <span>20m</span>
                            <span>30m</span>
                            <span>40m</span>
                          </div>

                          {/* Acoustic Nadir Line & Track Label */}
                          <div className="absolute top-0 bottom-0 left-9 w-px bg-cyan-400/40 border-r border-dashed border-cyan-300/60 pointer-events-none"></div>
                          <div className="absolute top-1.5 left-11 px-1.5 py-0.2 rounded bg-black/80 text-cyan-300 font-mono text-[8.5px] font-semibold border border-cyan-500/30 backdrop-blur-xs pointer-events-none z-10">
                            NADIR TRACK - SSS 900 kHz
                          </div>

                          {/* Top-Right HUD Telemetry Overlay */}
                          <div className="absolute top-1.5 right-1.5 px-2 py-1 rounded bg-black/85 border border-slate-700 text-slate-200 font-mono text-[8.5px] leading-tight backdrop-blur-xs text-right shadow-xs pointer-events-none z-10">
                            <div>Time: {currentBatchImage.timeHud}</div>
                            <div>Freq: {currentBatchImage.frequency}</div>
                            <div>Swath: {currentBatchImage.swath}</div>
                            <div>Speed: {currentBatchImage.speed}</div>
                          </div>

                          {/* Scale Bar at Bottom Right: [ 50 m ] */}
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-white font-mono text-[8.5px] flex items-center justify-center space-x-1 pointer-events-none z-10">
                            <span className="w-1 h-1 border-l border-white inline-block"></span>
                            <span className="w-10 h-0.5 bg-white inline-block"></span>
                            <span className="px-1 text-slate-200 font-bold">50 m</span>
                            <span className="w-10 h-0.5 bg-white inline-block"></span>
                            <span className="w-1 h-1 border-r border-white inline-block"></span>
                          </div>

                          {/* Bounding Boxes for Detections */}
                          {batchImageDisplayMode === 'detected' && (
                            <>
                              {currentBatchImage.detections.map((det: BatchDetectionObject) => {
                                const isCardSelected = selectedDetectionCardId === det.id;

                                let boxStyle: React.CSSProperties = {
                                  top: '55%',
                                  left: '16%',
                                  width: '28%',
                                  height: '24%',
                                };

                                if (det.orderNumber === 1) {
                                  boxStyle = { top: '55%', left: '16%', width: '28%', height: '25%' };
                                } else if (det.orderNumber === 2) {
                                  boxStyle = { top: '22%', left: '38%', width: '28%', height: '28%' };
                                } else if (det.orderNumber === 3) {
                                  boxStyle = { top: '46%', left: '68%', width: '20%', height: '28%' };
                                }

                                const boxBorderColor =
                                  det.color === 'red'
                                    ? 'border-rose-500'
                                    : det.color === 'blue'
                                      ? 'border-blue-500'
                                      : 'border-amber-500';

                                const boxBgColor =
                                  det.color === 'red'
                                    ? 'bg-rose-500/15'
                                    : det.color === 'blue'
                                      ? 'bg-blue-500/15'
                                      : 'bg-amber-500/15';

                                const tagBg =
                                  det.color === 'red'
                                    ? 'bg-rose-500 text-white'
                                    : det.color === 'blue'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-amber-500 text-white';

                                return (
                                  <div
                                    key={det.id}
                                    onClick={() => setSelectedDetectionCardId(det.id)}
                                    className={`absolute border-2 transition-all cursor-pointer ${boxBorderColor} ${boxBgColor} ${isCardSelected ? 'ring-2 ring-white shadow-lg' : ''
                                      }`}
                                    style={boxStyle}
                                  >
                                    <span
                                      className={`absolute -top-4.5 left-0 px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold shadow-xs whitespace-nowrap ${tagBg}`}
                                    >
                                      {det.orderNumber}. {detectionReviewMap[det.id]?.category || det.name} ({det.confidence}%)
                                    </span>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>

                        {/* Toolbar: Mode Switcher & Zoom Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-0.5">
                          {/* Mode Switcher */}
                          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setBatchImageDisplayMode('original')}
                              className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${batchImageDisplayMode === 'original'
                                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              Original Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setBatchImageDisplayMode('detected')}
                              className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${batchImageDisplayMode === 'detected'
                                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              Detected Objects
                            </button>
                          </div>

                          {/* Zoom & Inspect Tools */}
                          <div className="flex items-center space-x-1 text-slate-600">
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Inspect"
                            >
                              <Search className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBatchZoomLevel(z => Math.max(50, z - 10))}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] font-mono font-bold px-1 text-slate-700">
                              {batchZoomLevel}%
                            </span>
                            <button
                              type="button"
                              onClick={() => setBatchZoomLevel(z => Math.min(200, z + 10))}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Zoom In"
                            >
                              <ZoomIn className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBatchZoomLevel(100)}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Reset"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Operator Verification & Classification Action Box (Fills remaining vertical space below sonar) */}
                      {activeDetection ? (
                        <div className="p-2 sm:p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 shadow-2xs space-y-1.5 relative">
                          {/* Header: Target Identification & Review Status */}
                          <div className="flex items-center justify-between gap-1 border-b border-slate-200/60 pb-1">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                              <span className="text-[11px] font-bold text-slate-900 truncate">
                                Target #{activeDetection.orderNumber}: {activeReview?.category || activeDetection.name}
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-500 shrink-0">
                                ({activeDetection.confidence}%)
                              </span>
                            </div>

                            {/* Status badge */}
                            <div className="shrink-0">
                              {activeReview?.status === 'confirmed' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Confirmed Debris</span>
                                </span>
                              )}
                              {activeReview?.status === 'rejected' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <X className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>False Alarm (Rejected)</span>
                                </span>
                              )}
                              {activeReview?.status === 'classified' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>Reclassified</span>
                                </span>
                              )}
                              {(!activeReview?.status || activeReview.status === 'pending') && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending Review</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick description & coordinates */}
                          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500">
                            <span>Pos: {activeDetection.coordinates}</span>
                            <span>Size: {activeDetection.size}m</span>
                          </div>

                          {/* 3 Operator Buttons: Confirm, Reject, Classify */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {/* 1. Confirm */}
                            <button
                              type="button"
                              onClick={() => {
                                handleOperatorVerify(activeDetection.id, 'CONFIRMED');
                              }}
                              className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${activeReview?.status === 'confirmed'
                                ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300'
                                }`}
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Confirm</span>
                            </button>

                            {/* 2. Reject */}
                            <button
                              type="button"
                              onClick={() => {
                                handleOperatorVerify(activeDetection.id, 'REJECTED');
                              }}
                              className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${activeReview?.status === 'rejected'
                                ? 'bg-rose-600 text-white ring-1 ring-rose-400'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300'
                                }`}
                            >
                              <X className="w-3 h-3 stroke-[2.5]" />
                              <span>Reject</span>
                            </button>

                            {/* 3. Classify */}
                            <div className="relative flex-1">
                              <button
                                type="button"
                                onClick={() => setIsClassifyDropdownOpen(!isClassifyDropdownOpen)}
                                className={`w-full flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${activeReview?.status === 'classified'
                                  ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300'
                                  }`}
                              >
                                <Tag className="w-3 h-3" />
                                <span>Classify</span>
                                <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                              </button>

                              {/* Classification Dropdown */}
                              {isClassifyDropdownOpen && (
                                <div className="absolute right-0 bottom-full mb-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 space-y-0.5">
                                  <div className="px-2 py-1 text-[9.5px] font-mono uppercase font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                                    <span>Correct Object Class</span>
                                    <button
                                      type="button"
                                      onClick={() => setIsClassifyDropdownOpen(false)}
                                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {[
                                    { label: 'Sunken Container', icon: '📦' },
                                    { label: 'Fishing Gear / Ghost Net', icon: '🕸️' },
                                    { label: 'Marine Debris (Plastic/Metal)', icon: '🛢️' },
                                    { label: 'Rock Outcrop / Natural Feature', icon: '🪨' },
                                    { label: 'Shipwreck / Structural Hull', icon: '🚢' },
                                    { label: 'Subsea Cable / Pipeline', icon: '⚡' },
                                    { label: 'Unknown Anomaly', icon: '❓' },
                                  ].map(cat => (
                                    <button
                                      key={cat.label}
                                      type="button"
                                      onClick={() => {
                                        handleOperatorVerify(activeDetection.id, 'CONFIRMED', cat.label);
                                        setIsClassifyDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-2 py-1 rounded-md text-[10.5px] font-medium hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <span>{cat.icon} {cat.label}</span>
                                      {activeReview?.category === cat.label && (
                                        <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-[10.5px] text-slate-400">
                          Select a detected object to review and classify.
                        </div>
                      )}
                    </div>

                    {/* ------------------------------------------------------- */}
                    {/* RIGHT COLUMN: Detections in This Image (Max 4 Items)    */}
                    {/* ------------------------------------------------------- */}
                    <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        {/* Header */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Detections in This Image ({currentBatchImage.detections.length})
                        </h3>

                        {/* List of Detection Cards (Max 4 items) */}
                        <div className="space-y-2">
                          {currentBatchImage.detections.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200/60">
                              No objects detected in this image.
                            </div>
                          ) : (
                            currentBatchImage.detections.slice(0, 4).map((det: BatchDetectionObject) => {
                              const isSelected = selectedDetectionCardId === det.id;
                              const reviewInfo = detectionReviewMap[det.id];

                              const accentStripeColor =
                                det.color === 'red'
                                  ? 'bg-rose-500'
                                  : det.color === 'blue'
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500';

                              const confidenceTextColor =
                                det.color === 'red'
                                  ? 'text-rose-600'
                                  : det.color === 'blue'
                                    ? 'text-blue-600'
                                    : 'text-amber-600';

                              return (
                                <div
                                  key={det.id}
                                  onClick={() => setSelectedDetectionCardId(det.id)}
                                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden p-2 ${isSelected
                                    ? 'border-blue-300 bg-blue-50/30 shadow-2xs ring-1 ring-blue-200'
                                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                  {/* Card Title & Review Pill */}
                                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                    <div className="flex items-center space-x-1.5 min-w-0">
                                      <span className={`w-1 h-3 rounded-full ${accentStripeColor} shrink-0`}></span>
                                      <h4 className="text-[11px] font-bold text-slate-900 truncate">
                                        {det.orderNumber}. {reviewInfo?.category || det.name}
                                      </h4>
                                    </div>
                                    <div className="flex items-center space-x-1 shrink-0">
                                      {reviewInfo?.status === 'confirmed' && (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                          ✓ Confirmed
                                        </span>
                                      )}
                                      {reviewInfo?.status === 'rejected' && (
                                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                          ✗ Rejected
                                        </span>
                                      )}
                                      {reviewInfo?.status === 'classified' && (
                                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                          ✎ Tagged
                                        </span>
                                      )}
                                      <span className={`text-[11px] font-black font-mono ${confidenceTextColor}`}>
                                        {det.confidence}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Body with Thumbnail and Metadata */}
                                  <div className="flex items-center gap-2 pt-1.5">
                                    {/* Thumbnail */}
                                    <div className="w-11 h-11 rounded-md bg-black border border-slate-200 overflow-hidden shrink-0">
                                      <img
                                        src={
                                          det.orderNumber === 1
                                            ? '/sonar-tile-2.jpg'
                                            : det.orderNumber === 2
                                              ? '/sonar-tile-3.jpg'
                                              : '/sonar-tile-1.jpg'
                                        }
                                        alt={det.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 space-y-0.5 text-[10px]">
                                      <div className="flex items-center justify-between text-slate-500">
                                        <span>Type</span>
                                        <span className="font-semibold text-slate-800 truncate max-w-[95px]">
                                          {reviewInfo?.category || det.type}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-500">
                                        <span>Coordinates</span>
                                        <span className="font-mono text-[9px] text-slate-700 truncate max-w-[95px]">
                                          {det.coordinates}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-500">
                                        <span>Size (m)</span>
                                        <span className="font-mono text-slate-700">
                                          {det.size}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-500">
                                        <span>Confidence</span>
                                        <span className="font-mono font-bold text-emerald-600">
                                          {det.confidence}%
                                        </span>
                                      </div>
                                    </div>

                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Footer Tip */}
                      <div className="pt-1 text-[9.5px] font-mono text-slate-400 text-center border-t border-slate-100">
                        Click any detection to view & classify
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 3. BOTTOM ANALYTICS & DISTRIBUTION PANEL                  */}
                  {/* ========================================================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
                    {/* Distribution Card: 100 Blocks Grid (lg:col-span-8) */}
                    <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                        Detection Distribution Across All Images
                      </h3>

                      {/* 100-Block Visualization (Exact 50 columns x 2 rows) */}
                      <div
                        className="w-full py-0.5"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(50, minmax(0, 1fr))',
                          gap: '2px',
                        }}
                      >
                        {allBatchSurveyImages.map(img => {
                          let blockBg = '#cbd5e1'; // slate-300
                          if (img.priority === 'High') {
                            blockBg = '#ef4444'; // rose-500
                          } else if (img.priority === 'Medium') {
                            blockBg = '#f59e0b'; // amber-500
                          } else if (img.priority === 'Low') {
                            blockBg = '#10b981'; // emerald-500
                          }

                          const isCurrent = img.id === selectedBatchImageId;

                          return (
                            <div
                              key={img.id}
                              onClick={() => {
                                setSelectedBatchImageId(img.id);
                                if (img.detections.length > 0) {
                                  setSelectedDetectionCardId(img.detections[0].id);
                                }
                              }}
                              className={`h-2.5 sm:h-3 rounded-[1px] transition-all cursor-pointer ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 scale-125 z-10' : 'hover:opacity-80'
                                }`}
                              style={{ backgroundColor: blockBg }}
                              title={`${img.filename}: ${img.objectsCount} objects (${img.priority})`}
                            />
                          );
                        })}
                      </div>

                      {/* Legend & Footnote */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-0.5 text-slate-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-[1px] bg-rose-500"></span>
                            <span className="text-[10.5px] font-medium text-slate-600">
                              Images with detections (10)
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-[1px] bg-slate-300"></span>
                            <span className="text-[10.5px] font-medium text-slate-600">
                              Images without detections (90)
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          Each block represents one image
                        </span>
                      </div>
                    </div>

                    {/* Priority Breakdown Card: Progress Bars (lg:col-span-4)   */}
                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                        Priority Breakdown (28 objects)
                      </h3>

                      <div className="space-y-1.5 pt-0.5 text-xs">
                        {/* High Priority Bar */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">High Priority</span>
                            <span className="font-mono font-bold text-slate-900">5 (18%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>

                        {/* Medium Priority Bar */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">Medium Priority</span>
                            <span className="font-mono font-bold text-slate-900">12 (43%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '43%' }}></div>
                          </div>
                        </div>

                        {/* Low Priority Bar */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">Low Priority</span>
                            <span className="font-mono font-bold text-slate-900">11 (39%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '39%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 1: DETECTION MAP (Image 1) */}
        {/* ========================================================= */}
        {currentScreen === 'map' && (
          <main className="p-3 sm:p-4 lg:p-4 space-y-2.5 max-w-7xl mx-auto w-full">
            {/* Header with Survey Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Detection Map
                </h1>
                <p className="text-xs text-slate-500">
                  View geolocated detections from the current survey.
                </p>
              </div>

              <div className="relative">
                <select
                  value={selectedMapSurvey}
                  onChange={(e) => setSelectedMapSurvey(e.target.value)}
                  className="appearance-none flex items-center pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="All Surveys">All Surveys</option>
                  {backendSurveys.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Top Grid: Map Viewport (Left) + Detections List (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Left Column (7 cols): Map Box */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs h-[255px] sm:h-[275px]">
                {/* Map layer toggle top-left */}
                <div className="absolute top-2 left-2 z-10 flex items-center rounded-lg overflow-hidden border border-slate-700/60 shadow-md bg-slate-900/80 backdrop-blur-xs p-0.5 text-[10.5px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setMapLayerMode('map')}
                    className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${mapLayerMode === 'map'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                      }`}
                  >
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLayerMode('satellite')}
                    className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${mapLayerMode === 'satellite'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                      }`}
                  >
                    Satellite
                  </button>
                </div>

                {/* Map zoom & locate controls top-right */}
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1 bg-white/90 backdrop-blur-xs rounded-lg border border-slate-200 shadow-xs p-0.5">
                  <button
                    type="button"
                    onClick={() => fullMapInstance.current?.zoomIn()}
                    className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded text-xs font-bold cursor-pointer"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => fullMapInstance.current?.zoomOut()}
                    className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded text-xs font-bold cursor-pointer"
                    title="Zoom out"
                  >
                    &minus;
                  </button>
                  <button
                    type="button"
                    onClick={() => fullMapInstance.current?.setView([17.1, 72.8], 7)}
                    className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded text-xs cursor-pointer"
                    title="Reset center"
                  >
                    <Locate className="w-3 h-3 text-slate-600" />
                  </button>
                </div>

                {/* Leaflet Map Div */}
                <div ref={fullMapRef} className="w-full h-full z-0"></div>

                {/* Bottom-left Legend badge */}
                <div className="absolute bottom-2 left-2 z-10 bg-slate-950/85 backdrop-blur-md rounded-xl p-2 border border-slate-700/60 shadow-lg text-[9.5px] space-y-1 text-slate-200">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Verified</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Unverified</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>High Priority</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Other</span>
                  </div>
                </div>

                {/* Bottom-right Scale Bar */}
                <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9.5px] font-mono text-white">
                  <div className="w-8 border-b-2 border-white"></div>
                  <span>50 km</span>
                </div>
              </div>

              {/* Right Column (5 cols): Detections List */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-2 flex flex-col justify-between h-[255px] sm:h-[275px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                    Detections ({detailedDetections.length})
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border border-slate-200 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Filter className="w-3 h-3 text-slate-500" />
                    <span>Filter</span>
                  </button>
                </div>

                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                  {detailedDetections.map((det) => (
                    <div
                      key={det.id}
                      onClick={() => {
                        setSelectedMapDetectionId(det.id);
                        fullMapInstance.current?.flyTo([det.rawLat, det.rawLng], 9, { duration: 0.8 });
                      }}
                      className={`p-1.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedMapDetectionId === det.id
                        ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <img
                          src={det.thumb}
                          alt={det.name}
                          className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0 bg-black"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{det.number}</span>
                            <span className="text-xs font-bold text-slate-900 truncate">{det.name}</span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 truncate">
                            {det.lat}, {det.lng}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border ${det.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                          {det.confidence}% {det.status}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-center space-x-1 text-[11px] font-mono text-slate-600">
                  <button type="button" aria-label="Previous page" className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 cursor-pointer">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button type="button" className="w-5 h-5 flex items-center justify-center rounded bg-blue-600 text-white font-bold cursor-pointer">
                    1
                  </button>
                  <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 cursor-pointer">
                    2
                  </button>
                  <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 cursor-pointer">
                    3
                  </button>
                  <button type="button" aria-label="Next page" className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 cursor-pointer">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Survey Statistics (Left) + Export Results (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Left Column (8 cols): Survey Statistics */}
              <div className="lg:col-span-8 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                  Survey Statistics
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">5</div>
                      <div className="text-[10px] text-slate-500">Images Processed</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Crosshair className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">12</div>
                      <div className="text-[10px] text-slate-500">Total Detections</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">2</div>
                      <div className="text-[10px] text-slate-500">High Priority</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">9</div>
                      <div className="text-[10px] text-slate-500">Verified</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Export Results */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 space-y-1.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-['Space_Grotesk']">
                    Export Results
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Download detections with location, classification and confidence scores.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                  >
                    <Code className="w-3 h-3 text-slate-500" />
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-blue-600" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('new-survey');
                  setNewSurveyStep(4);
                }}
                className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs cursor-pointer transition-colors"
              >
                <span>&larr; Back to Results</span>
              </button>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: SURVEY REPORT (Image 2) */}
        {/* ========================================================= */}
        {currentScreen === 'reports' && (
          <main className="p-3 sm:p-4 lg:p-4 space-y-2.5 max-w-7xl mx-auto w-full">
            {/* Header: Title on left, Action Buttons aligned on the same line */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Survey Report
                </h1>
                <p className="text-xs text-slate-500">
                  Detailed analysis results and insights from your sonar survey.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('map')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>View on Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>

            {/* Survey Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                    Arabian Sea Survey - Sept 2025
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>23 Sep 2025</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Arabian Sea (West Coast)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ImageIcon className="w-3 h-3 text-slate-400" />
                    <span>5 images processed</span>
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 pt-0.5">
                  Routine survey to detect potential marine debris in the designated area.
                </p>
              </div>

              {/* Right decorative slogan badge */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 sm:p-3 flex items-center space-x-2.5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-900">Cleaner Oceans</div>
                  <div className="text-[10.5px] text-blue-700 font-medium">Safer Tomorrow.</div>
                </div>
              </div>
            </div>

            {/* 5 KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">5</div>
                  <div className="text-[10px] text-slate-500">Images Processed</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Crosshair className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">12</div>
                  <div className="text-[10px] text-slate-500">Total Detections</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">2</div>
                  <div className="text-[10px] text-slate-500">High Priority</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">9</div>
                  <div className="text-[10px] text-slate-500">Verified</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">2</div>
                  <div className="text-[10px] text-slate-500">Unclassified</div>
                </div>
              </div>
            </div>

            {/* Main Section: Detections Table (Left) + Survey Area & Notes (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Left Column (7 cols): Detections Table */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                    Detections
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border border-slate-200 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Filter className="w-3 h-3 text-slate-500" />
                    <span>Filter</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-500 uppercase text-[9.5px]">
                      <tr>
                        <th className="py-1.5 px-2">ID</th>
                        <th className="py-1.5 px-2">Thumbnail</th>
                        <th className="py-1.5 px-2">Classification</th>
                        <th className="py-1.5 px-2">Confidence</th>
                        <th className="py-1.5 px-2">Location (Lat, Lon)</th>
                        <th className="py-1.5 px-2">Status</th>
                        <th className="py-1.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {detailedDetections.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-1 px-2 font-mono font-bold text-slate-500">{d.number}</td>
                          <td className="py-1 px-2">
                            <img
                              src={d.thumb}
                              alt={d.name}
                              className="w-7 h-7 rounded object-cover border border-slate-200 bg-black"
                            />
                          </td>
                          <td className="py-1 px-2 font-bold text-slate-900">{d.name}</td>
                          <td className="py-1 px-2 font-mono font-bold text-emerald-600">
                            {d.confidence}%
                          </td>
                          <td className="py-1 px-2 font-mono text-slate-500 text-[10px]">
                            {d.lat}, {d.lng}
                          </td>
                          <td className="py-1 px-2">
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border ${d.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-1 px-2 text-right text-slate-400">
                            <button type="button" className="p-1 hover:text-slate-700 cursor-pointer">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (5 cols): Survey Area Map + Notes */}
              <div className="lg:col-span-5 space-y-2.5">
                {/* Survey Area Mini Map */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 font-['Space_Grotesk']">
                    Survey Area
                  </h4>

                  <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                    <div ref={reportMapRef} className="w-full h-full z-0"></div>

                    {/* Bottom Legend */}
                    <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[8.5px] text-slate-200">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Verified</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Unverified</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>High Priority</span>
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 z-10 text-[8.5px] font-mono text-white bg-black/60 px-1.5 py-0.2 rounded">
                      50 km
                    </div>
                  </div>
                </div>

                {/* Notes & Observations */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 font-['Space_Grotesk']">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notes &amp; Observations</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-0.5 list-disc pl-4 leading-relaxed">
                    <li>One pipeline-like structure detected with high confidence.</li>
                    <li>Two unknown anomalies require manual verification.</li>
                    <li>Possible fishing gear detected near the survey area.</li>
                    <li>No significant natural formation misclassifications observed.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Row Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>&larr; Back to Dashboard</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: SURVEY HISTORY (Image 3) */}
        {/* ========================================================= */}
        {currentScreen === 'surveys' && (
          <main className="p-3 sm:p-4 lg:p-4 space-y-2.5 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Survey History
                </h1>
                <p className="text-xs text-slate-500">
                  View and manage all your marine surveys.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('new-survey');
                  setNewSurveyStep(1);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Survey</span>
              </button>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                {(['all', 'completed', 'processing', 'high_priority', 'archived'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSurveyTabFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer capitalize ${surveyTabFilter === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {tab === 'all'
                      ? 'All Surveys'
                      : tab === 'high_priority'
                        ? 'High Priority'
                        : tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 shadow-2xs">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] font-semibold">All Time</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Main 2-Column Grid: Left Catalog Table + Right Survey Detail Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Left Column (8 cols): Surveys Table */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[350px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-500 uppercase text-[9.5px] sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-2.5">#</th>
                        <th className="py-2 px-2.5">Survey Name</th>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Location</th>
                        <th className="py-2 px-2.5">Images</th>
                        <th className="py-2 px-2.5">Detections</th>
                        <th className="py-2 px-2.5">Status</th>
                        <th className="py-2 px-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {surveyCatalogData
                        .filter((s) => {
                          if (surveyTabFilter === 'all') return true;
                          if (surveyTabFilter === 'completed') return s.status === 'Completed';
                          if (surveyTabFilter === 'processing') return s.status === 'Processing';
                          if (surveyTabFilter === 'high_priority') return s.status === 'High Priority';
                          if (surveyTabFilter === 'archived') return s.status === 'Archived';
                          return true;
                        })
                        .map((srv) => (
                          <tr
                            key={srv.id}
                            onClick={() => setSelectedCatalogSurveyId(srv.id)}
                            className={`cursor-pointer transition-colors ${selectedCatalogSurveyId === srv.id
                              ? 'bg-blue-50/50 font-semibold'
                              : 'hover:bg-slate-50'
                              }`}
                          >
                            <td className="py-1.5 px-2.5 font-mono text-slate-400">{srv.number}</td>
                            <td className="py-1.5 px-2.5 font-bold text-slate-900">{srv.name}</td>
                            <td className="py-1.5 px-2.5 font-mono text-slate-500 text-[10px]">{srv.date}</td>
                            <td className="py-1.5 px-2.5 text-slate-600">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{srv.location}</span>
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 font-mono text-slate-600">{srv.images}</td>
                            <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900">{srv.detections}</td>
                            <td className="py-1.5 px-2.5">
                              <span
                                className={`px-2 py-0.2 rounded-full text-[9.5px] font-bold font-mono border ${srv.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : srv.status === 'Processing'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : srv.status === 'High Priority'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                              >
                                {srv.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-right text-slate-400">
                              <MoreHorizontal className="w-3.5 h-3.5 inline" />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="py-1.5 px-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
                  <span>Showing 1-10 of 10 surveys</span>
                  <div className="flex items-center space-x-1">
                    <button type="button" aria-label="Previous page" className="w-5 h-5 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold cursor-pointer">
                      1
                    </button>
                    <button type="button" aria-label="Next page" className="w-5 h-5 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Selected Survey Inspector */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      {selectedCatalogSurvey.name}
                    </h3>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[9.5px] font-bold font-mono border ${selectedCatalogSurvey.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}
                    >
                      {selectedCatalogSurvey.status}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[10.5px] text-slate-500 mt-1">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{selectedCatalogSurvey.fullDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{selectedCatalogSurvey.location}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                    {selectedCatalogSurvey.description}
                  </p>
                </div>

                {/* Quick Stats 2x2 */}
                <div>
                  <h4 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk'] mb-1">
                    Quick Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center space-x-2">
                      <div className="p-1 rounded bg-blue-50 text-blue-600">
                        <ImageIcon className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900">{selectedCatalogSurvey.images}</div>
                        <div className="text-[9px] text-slate-500">Processed</div>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center space-x-2">
                      <div className="p-1 rounded bg-purple-50 text-purple-600">
                        <Crosshair className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900">{selectedCatalogSurvey.detections}</div>
                        <div className="text-[9px] text-slate-500">Detections</div>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center space-x-2">
                      <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900">{selectedCatalogSurvey.verifiedCount}</div>
                        <div className="text-[9px] text-slate-500">Verified</div>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center space-x-2">
                      <div className="p-1 rounded bg-amber-50 text-amber-600">
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900">{selectedCatalogSurvey.unclassifiedCount}</div>
                        <div className="text-[9px] text-slate-500">Unclassified</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Detections */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                      Recent Detections
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('map')}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="space-y-1">
                    {detailedDetections.slice(0, 3).map((d) => (
                      <div
                        key={d.id}
                        className="p-1 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <img src={d.thumb} alt={d.name} className="w-6 h-6 rounded object-cover bg-black" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-[10.5px] truncate">{d.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{d.confidence}% conf</div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('reports')}
                    className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>View Full Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentScreen('map')}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: SETTINGS (Image 4) */}
        {/* ========================================================= */}
        {currentScreen === 'settings' && (
          <main className="p-3.5 sm:p-4 lg:p-5 space-y-4 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                Settings
              </h1>
              <p className="text-xs text-slate-500">
                Manage your account, preferences, and system settings.
              </p>
            </div>

            {/* Main 2-Column Section: Left Vertical Tabs + Right Form Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              {/* Left Column (4 cols): Vertical Settings Tabs */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 space-y-1">
                {[
                  { id: 'profile', icon: User, title: 'Profile', desc: 'Manage your account information' },
                  { id: 'preferences', icon: SettingsIcon, title: 'Preferences', desc: 'Application settings' },
                  { id: 'storage', icon: Database, title: 'Data & Storage', desc: 'Manage your uploaded data' },
                  { id: 'security', icon: Shield, title: 'Security', desc: 'Password and access' },
                  { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Email and in-app alerts' },
                  { id: 'about', icon: Info, title: 'About', desc: 'Version and system information' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = settingsTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSettingsTab(item.id as typeof settingsTab)}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${isActive
                        ? 'bg-blue-50 border border-blue-200/80 text-blue-700 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Right Column (8 cols): Settings Form Card */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 min-h-[380px]">
                {settingsTab === 'profile' && (
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Profile Information
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Update your personal and organization details.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileSaved(true);
                          setTimeout(() => setIsProfileSaved(false), 3000);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        {isProfileSaved ? 'Saved!' : 'Save Changes'}
                      </button>
                    </div>

                    {/* Section: Account Details */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                        Account Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
                        {/* Left Inputs (8 cols) */}
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileFullName}
                              onChange={(e) => setProfileFullName(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                              Role
                            </label>
                            <input
                              type="text"
                              value={profileRole}
                              readOnly
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                              Organization
                            </label>
                            <input
                              type="text"
                              value={profileOrg}
                              onChange={(e) => setProfileOrg(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                              Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Right Profile Picture (4 cols) */}
                        <div className="md:col-span-4 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col items-center justify-center space-y-2 text-center">
                          <span className="text-[10.5px] font-mono font-bold text-slate-600 self-start">
                            Profile Picture
                          </span>
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            A
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <span className="text-[9.5px] font-mono text-slate-400">JPG, PNG up to 2MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Organization / Team */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                        Organization / Team
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                            Team Name
                          </label>
                          <input
                            type="text"
                            value={profileTeam}
                            onChange={(e) => setProfileTeam(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                            Location
                          </label>
                          <input
                            type="text"
                            value={profileLocation}
                            onChange={(e) => setProfileLocation(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                            Bio (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={profileBio}
                            maxLength={200}
                            onChange={(e) => setProfileBio(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          ></textarea>
                          <div className="text-right text-[10px] font-mono text-slate-400">
                            {profileBio.length}/200
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'preferences' && (
                  <div className="space-y-3">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-100">
                      Application Preferences
                    </h2>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">High-Resolution Waterfall Tiles</div>
                          <div className="text-[10.5px] text-slate-500">Render uncompressed 16-bit acoustic backscatter</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Auto Slant Range Correction (SRC)</div>
                          <div className="text-[10.5px] text-slate-500">Automatically rectify geometric distortions</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'storage' && (
                  <div className="space-y-3">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-100">
                      Data &amp; Storage Buckets
                    </h2>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Cloudflare R2 Object Bucket</div>
                          <div className="text-[10.5px] text-slate-500">Target: vainateya-sonar-swaths</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono text-[10px]">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-3">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-100">
                      Security &amp; Access Controls
                    </h2>
                    <p className="text-xs text-slate-500">
                      Two-factor authentication and role-based session permissions are managed through MoES NIOT SSO.
                    </p>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-3">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-100">
                      Email &amp; In-App Notifications
                    </h2>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-medium text-slate-700">High priority anomaly alerts</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-medium text-slate-700">Survey batch completion emails</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'about' && (
                  <div className="space-y-2 text-xs">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-100">
                      VAINATEYA System Information
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      VAINATEYA Marine Survey &amp; Underwater Debris Detection Platform. Designed for Ministry of Earth Sciences (MoES) and National Institute of Ocean Technology (NIOT).
                    </p>
                    <div className="font-mono text-[10px] text-slate-500 pt-1">
                      Version: 2.4.0-sih2026 &bull; Build: September 2026
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Report Modal */}
      {
        isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Generate Survey Report
                </h3>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Export verified detection summaries, GPS coordinates, and acoustic shadow geometry for salvage vessels and research teams.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                    setIsReportModalOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Executive PDF Summary</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    handleExportCSV();
                    setIsReportModalOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Raw Detections CSV Table</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Supported Formats Modal */}
      {
        isSupportedFormatsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                      Supported Sonar Image Formats
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Specifications for Side-Scan Sonar (SSS) Batch Ingestion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSupportedFormatsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="px-2 py-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold shrink-0">
                    TIFF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">GeoTIFF / TIFF (.tif, .tiff)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Industry standard for uncompressed raw acoustic waterfall swaths. Preserves 16-bit acoustic backscatter dynamics and coordinate tags.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="px-2 py-1 rounded bg-sky-600 text-white font-mono text-[10px] font-bold shrink-0">
                    PNG
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">Portable Network Graphics (.png)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Lossless compression ideal for clear sonar waterfall frames, avoiding JPEG ringing artifacts around subtle acoustic shadows.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="px-2 py-1 rounded bg-slate-700 text-white font-mono text-[10px] font-bold shrink-0">
                    JPEG
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">Joint Photographic Experts (.jpg, .jpeg)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      High compatibility, standard export from Klein, Edgetech, and StarFish sonar acquisition software.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="px-2 py-1 rounded bg-purple-600 text-white font-mono text-[10px] font-bold shrink-0">
                    BMP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">Windows Bitmap (.bmp)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Uncompressed legacy hydrographic capture format directly compatible with bathymetric mapping stations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ingestion Parameters */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Ingestion Parameters</span>
                </div>
                <p className="text-blue-800/80 leading-relaxed">
                  Maximum file size: <b>25 MB per file</b> &bull; Maximum batch: <b>50 images per survey</b> &bull; Native Slant Range Correction (SRC) recommended.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsSupportedFormatsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
