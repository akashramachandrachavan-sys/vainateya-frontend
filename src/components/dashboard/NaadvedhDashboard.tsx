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
  MoreHorizontal
} from 'lucide-react';
import { ShadowGeometryCard } from './ShadowGeometryCard';
import type { DebrisDetection } from '../../types';

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

const initialDetections: DetectionItem[] = [
  {
    id: 'DET-001',
    type: 'Fishing Gear',
    confidence: 93,
    lat: '15.1234° N',
    lng: '73.5432° E',
    color: '#ef4444',
    status: 'Confirmed',
    operatorNote: 'Suspected ghost net cluster draped on seabed',
    shadowLengthMeters: 4.8,
    estimatedHeightMeters: 1.4,
  },
  {
    id: 'DET-002',
    type: 'Debris',
    confidence: 88,
    lat: '15.1278° N',
    lng: '73.5489° E',
    color: '#3b82f6',
    status: 'Pending Review',
    operatorNote: 'Submerged cargo container with prominent acoustic shadow',
    shadowLengthMeters: 6.2,
    estimatedHeightMeters: 2.6,
  },
  {
    id: 'DET-003',
    type: 'Unknown',
    confidence: 64,
    lat: '15.1301° N',
    lng: '73.5512° E',
    color: '#10b981',
    status: 'Pending Review',
    operatorNote: 'Acoustic anomaly in navigation fairway',
    shadowLengthMeters: 3.1,
    estimatedHeightMeters: 0.9,
  },
];

interface UploadedFileItem {
  name: string;
  size: string;
  thumbnail: string;
}

const defaultFilesList: UploadedFileItem[] = [
  { name: 'sonar_001.tif', size: '12.4 MB', thumbnail: '/sonar-tile-1.jpg' },
  { name: 'sonar_002.tif', size: '8.7 MB', thumbnail: '/sonar-tile-2.jpg' },
  { name: 'sonar_003.tif', size: '15.1 MB', thumbnail: '/sonar-tile-3.jpg' },
  { name: 'sonar_004.tif', size: '9.3 MB', thumbnail: '/sonar-survey-sample.png' },
  { name: 'sonar_005.tif', size: '11.8 MB', thumbnail: '/sonar-tile-1.jpg' },
];

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

export const detailedDetections: MapDetection[] = [
  {
    id: 'det-1',
    number: '#1',
    name: 'Pipeline/Pipe',
    confidence: 87.1,
    lat: '17.68500°',
    lng: '83.21850°',
    rawLat: 17.4,
    rawLng: 72.4,
    status: 'Verified',
    category: 'Pipeline',
    color: '#10b981',
    markerType: 'green',
    thumb: '/sonar-tile-1.jpg',
  },
  {
    id: 'det-2',
    number: '#2',
    name: 'Unknown Anomaly',
    confidence: 62.1,
    lat: '17.68620°',
    lng: '83.21910°',
    rawLat: 17.8,
    rawLng: 72.7,
    status: 'Unverified',
    category: 'Anomaly',
    color: '#ef4444',
    markerType: 'red',
    thumb: '/sonar-tile-2.jpg',
  },
  {
    id: 'det-3',
    number: '#3',
    name: 'Possible Fishing Gear',
    confidence: 78.4,
    lat: '17.68410°',
    lng: '83.21790°',
    rawLat: 16.2,
    rawLng: 73.1,
    status: 'Verified',
    category: 'Fishing Gear',
    color: '#3b82f6',
    markerType: 'blue',
    thumb: '/sonar-tile-3.jpg',
  },
  {
    id: 'det-4',
    number: '#4',
    name: 'Unknown Anomaly',
    confidence: 55.2,
    lat: '17.68350°',
    lng: '83.22010°',
    rawLat: 17.1,
    rawLng: 72.8,
    status: 'Unverified',
    category: 'Anomaly',
    color: '#f59e0b',
    markerType: 'yellow',
    thumb: '/sonar-tile-1.jpg',
  },
  {
    id: 'det-5',
    number: '#5',
    name: 'Debris/Container',
    confidence: 71.6,
    lat: '17.68210°',
    lng: '83.22130°',
    rawLat: 15.8,
    rawLng: 73.3,
    status: 'Verified',
    category: 'Debris',
    color: '#10b981',
    markerType: 'green',
    thumb: '/sonar-tile-2.jpg',
  },
];

export interface SurveyCatalogItem {
  id: string;
  number: string;
  name: string;
  date: string;
  fullDate: string;
  location: string;
  images: number;
  detections: number;
  status: 'Completed' | 'Processing' | 'High Priority' | 'Archived';
  description: string;
  verifiedCount: number;
  unclassifiedCount: number;
}

export const surveyCatalogData: SurveyCatalogItem[] = [
  {
    id: 'srv-1',
    number: '#1',
    name: 'Arabian Sea Survey',
    date: '23 Sep 2025',
    fullDate: '23 Sep 2025, 10:24 AM',
    location: 'Arabian Sea (West Coast)',
    images: 5,
    detections: 12,
    status: 'Completed',
    description: 'Routine survey to detect potential marine debris in the designated area.',
    verifiedCount: 9,
    unclassifiedCount: 2,
  },
  {
    id: 'srv-2',
    number: '#2',
    name: 'Mumbai Coast Survey',
    date: '12 Sep 2025',
    fullDate: '12 Sep 2025, 02:15 PM',
    location: 'Mumbai',
    images: 8,
    detections: 7,
    status: 'Completed',
    description: 'Harbor approach sonar sweep for navigation obstacles and lost moorings.',
    verifiedCount: 6,
    unclassifiedCount: 1,
  },
  {
    id: 'srv-3',
    number: '#3',
    name: 'Goa Patch Survey',
    date: '28 Aug 2025',
    fullDate: '28 Aug 2025, 11:40 AM',
    location: 'Goa',
    images: 4,
    detections: 3,
    status: 'Completed',
    description: 'Fisheries conservation zone scan to detect ghost nets along coral reefs.',
    verifiedCount: 3,
    unclassifiedCount: 0,
  },
  {
    id: 'srv-4',
    number: '#4',
    name: 'Test Survey 01',
    date: '18 Aug 2025',
    fullDate: '18 Aug 2025, 04:20 PM',
    location: 'Lakshadweep',
    images: 6,
    detections: 4,
    status: 'Processing',
    description: 'Deep atoll hydrographic baseline testing with high-frequency side-scan sonar.',
    verifiedCount: 2,
    unclassifiedCount: 2,
  },
  {
    id: 'srv-5',
    number: '#5',
    name: 'Deep Sea Survey',
    date: '02 Aug 2025',
    fullDate: '02 Aug 2025, 09:00 AM',
    location: 'Arabian Sea',
    images: 10,
    detections: 15,
    status: 'Completed',
    description: 'Bathymetric survey of offshore hydrocarbon pipeline corridor.',
    verifiedCount: 13,
    unclassifiedCount: 2,
  },
  {
    id: 'srv-6',
    number: '#6',
    name: 'Coastal Validation',
    date: '21 Jul 2025',
    fullDate: '21 Jul 2025, 03:30 PM',
    location: 'Karwar',
    images: 3,
    detections: 1,
    status: 'Completed',
    description: 'Naval base approach channel clearance verification.',
    verifiedCount: 1,
    unclassifiedCount: 0,
  },
  {
    id: 'srv-7',
    number: '#7',
    name: 'Pilot Survey',
    date: '10 Jul 2025',
    fullDate: '10 Jul 2025, 01:10 PM',
    location: 'Mangalore',
    images: 7,
    detections: 6,
    status: 'Completed',
    description: 'Estuary sediment and discarded fishing gear monitoring survey.',
    verifiedCount: 5,
    unclassifiedCount: 1,
  },
  {
    id: 'srv-8',
    number: '#8',
    name: 'Unknown Area Scan',
    date: '25 Jun 2025',
    fullDate: '25 Jun 2025, 05:45 PM',
    location: 'Arabian Sea',
    images: 9,
    detections: 8,
    status: 'High Priority',
    description: 'Emergency search survey following commercial vessel container spill report.',
    verifiedCount: 4,
    unclassifiedCount: 4,
  },
  {
    id: 'srv-9',
    number: '#9',
    name: 'Model Evaluation',
    date: '14 Jun 2025',
    fullDate: '14 Jun 2025, 10:00 AM',
    location: 'Goa',
    images: 5,
    detections: 2,
    status: 'Completed',
    description: 'Benchmark calibration for YOLOv12 acoustic anomaly detector.',
    verifiedCount: 2,
    unclassifiedCount: 0,
  },
  {
    id: 'srv-10',
    number: '#10',
    name: 'Sample Data Run',
    date: '01 Jun 2025',
    fullDate: '01 Jun 2025, 08:30 AM',
    location: 'Test Area',
    images: 4,
    detections: 1,
    status: 'Archived',
    description: 'Synthetic and archived SSS dataset integration run.',
    verifiedCount: 1,
    unclassifiedCount: 0,
  },
];

export const NaadvedhDashboard: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('dashboard');
  const [newSurveyStep, setNewSurveyStep] = useState<1 | 2 | 3 | 4>(1);

  // Survey Details State
  const [surveyName, setSurveyName] = useState<string>('Arabian Sea Survey - Sept 2025');
  const [surveyLocation, setSurveyLocation] = useState<string>('Arabian Sea (West Coast)');
  const [surveyDate, setSurveyDate] = useState<string>('2025-09-23');
  const [surveyDescription, setSurveyDescription] = useState<string>(
    'Routine survey to detect potential marine debris in the designated area.'
  );

  // Files State
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileItem[]>(defaultFilesList.slice(0, 3));
  const [batchViewMode, setBatchViewMode] = useState<'grid' | 'list'>('grid');

  // Processing Screen State
  const [processingProgress, setProcessingProgress] = useState<number>(60);
  const [isProcessingComplete, setIsProcessingComplete] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(95);

  // Analysis / Results State
  const [analysisViewMode, setAnalysisViewMode] = useState<'detected' | 'original'>('detected');
  const [detections] = useState<DetectionItem[]>(initialDetections);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>(initialDetections[0].id);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSupportedFormatsModalOpen, setIsSupportedFormatsModalOpen] = useState<boolean>(false);

  // Map Screen state
  const [mapLayerMode, setMapLayerMode] = useState<'map' | 'satellite'>('satellite');
  const [selectedMapSurvey] = useState<string>('Arabian Sea Survey - Sept 2025');
  const [selectedMapDetectionId, setSelectedMapDetectionId] = useState<string>('det-1');

  // Surveys Screen state
  const [surveyTabFilter, setSurveyTabFilter] = useState<'all' | 'completed' | 'processing' | 'high_priority' | 'archived'>('all');
  const [selectedCatalogSurveyId, setSelectedCatalogSurveyId] = useState<string>('srv-1');

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

  const selectedDetection = detections.find(d => d.id === selectedDetectionId) || detections[0];
  const selectedCatalogSurvey = surveyCatalogData.find(s => s.id === selectedCatalogSurveyId) || surveyCatalogData[0];

  // Active Debris Detection for Shadow Geometry
  const activeDebrisDetection: DebrisDetection = {
    id: selectedDetection.id,
    name: selectedDetection.type,
    category: selectedDetection.type === 'Fishing Gear' ? 'ghost_net' : 'cargo_container',
    confidence: selectedDetection.confidence,
    bbox: { x: 46, y: 24, width: 22, height: 34 },
    coordinates: { lat: 15.1234, lng: 73.5432 },
    depthMeters: 28.5,
    shadowLengthMeters: selectedDetection.shadowLengthMeters,
    estimatedHeightMeters: selectedDetection.estimatedHeightMeters,
    acousticShadowVerified: true,
    severity: 'high',
    timestamp: '2025-09-23T14:32:00Z',
    materialComposition: selectedDetection.type === 'Fishing Gear' ? 'Synthetic Polymer Netting' : 'High-density Steel Alloy',
  };

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
  };

  const handleAddFiles = () => {
    setSelectedFiles(defaultFilesList);
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
      {/* 1. Minimalist White Sidebar (Matching Image 5 Reference) */}
      <aside className="w-56 sm:w-60 bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between shrink-0 select-none z-30">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-4 sm:p-5 flex items-center space-x-3 border-b border-slate-100">
            <img
              src="/vainateya-symbol.png"
              alt="VAINATEYA Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-extrabold text-base text-slate-900 font-['Space_Grotesk'] tracking-wider leading-none">
                VAINATEYA
              </h1>
              <p className="text-[9.5px] text-blue-600 font-mono tracking-tight mt-1 truncate italic font-medium">
                When human vision ends, perception continues.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
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
            <button
              type="button"
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>

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
                    12
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">
                    &uarr; +3 this month
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
                    86
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">
                    &uarr; +21 this month
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
                    4
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Needs review
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
                    8
                  </div>
                  <div className="text-[10px] text-slate-500">
                    67% completed
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
            </div>

            {/* Bottom Row: Quick Actions */}
            <div className="space-y-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                  Quick Actions
                </h3>
                <p className="text-[11px] text-slate-500">
                  Start a new survey or view results.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Action 1: New Survey */}
                <div
                  onClick={() => {
                    setCurrentScreen('new-survey');
                    setNewSurveyStep(1);
                  }}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      New Survey
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Upload sonar data
                    </div>
                  </div>
                </div>

                {/* Action 2: View Map */}
                <div
                  onClick={() => setCurrentScreen('map')}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <MapIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      View Map
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Explore detections
                    </div>
                  </div>
                </div>

                {/* Action 3: Generate Report */}
                <div
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      Generate Report
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Export results (JSON/CSV)
                    </div>
                  </div>
                </div>

                {/* Action 4: Detection History */}
                <div
                  onClick={() => {
                    setCurrentScreen('new-survey');
                    setNewSurveyStep(4);
                  }}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      Detection History
                    </div>
                    <div className="text-[10px] text-slate-500">
                      View past surveys
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: NEW SURVEY (Images 2, 3, 4, 5) */}
        {/* ========================================================= */}
        {currentScreen === 'new-survey' && (
          <main className="p-3.5 sm:p-4 lg:p-5 space-y-3 max-w-7xl mx-auto w-full">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-tight">
                New Survey
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload side-scan sonar imagery to detect and classify underwater debris and anomalies.
              </p>
            </div>

            {/* 4-Step Stepper Header (Images 2, 3, 4) */}
            <div className="flex items-center max-w-2xl pt-0 pb-1 text-xs font-mono font-bold">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                  {/* Left Box: Survey Information */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Survey Information
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Provide basic details about the survey.
                        </p>
                      </div>

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
                    </div>

                    {/* Why these details note */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 flex items-start space-x-2 mt-2">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[11px] font-bold text-blue-900 leading-tight">Why these details?</h5>
                        <p className="text-[10.5px] text-blue-700/90 leading-normal mt-0.5">
                          Survey information helps in organizing data, mapping detections, and generating accurate reports.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Upload Side-Scan Sonar Data */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Upload Side-Scan Sonar Data
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            Upload one or multiple sonar image files for analysis.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSupportedFormatsModalOpen(true)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors cursor-pointer"
                        >
                          <Info className="w-3 h-3 text-blue-600" />
                          <span>Supported Formats</span>
                        </button>
                      </div>

                      {/* Dropzone Box */}
                      <div
                        onClick={handleAddFiles}
                        className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-3.5 text-center bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer space-y-1"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          Drag &amp; drop sonar images here
                        </div>
                        <div className="text-[10px] text-slate-400">or</div>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Browse Files
                        </button>
                        <p className="text-[10px] font-mono text-slate-400 pt-0.5">
                          PNG, JPEG, TIFF, or BMP &bull; Up to 25 MB per file &bull; Multiple files allowed
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
                    onClick={() => {
                      if (selectedFiles.length === 0) setSelectedFiles(defaultFilesList);
                      setNewSurveyStep(2);
                    }}
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
                        onClick={() => setNewSurveyStep(3)}
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
            {newSurveyStep === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                  {/* Left Column (5 cols): Survey Position & Shadow Verification */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Survey Position mini map card */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Survey position
                        </h3>
                        <span className="text-[9.5px] font-mono text-slate-500">
                          {selectedDetection.lat}, {selectedDetection.lng}
                        </span>
                      </div>

                      <div className="relative h-28 sm:h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src="/sonar-tile-2.jpg"
                          alt="Survey position bathymetry"
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white"></div>
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-white/90 text-[9px] font-mono text-slate-700 shadow-2xs">
                          Goa / Maharashtra Coast
                        </div>
                      </div>
                    </div>

                    {/* Shadow Geometry Verification */}
                    <ShadowGeometryCard
                      detection={activeDebrisDetection}
                      sensorAltitude={9.0}
                      slantRange={45.0}
                    />
                  </div>

                  {/* Right Column (7 cols): Detection Results Viewport */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-2.5">
                    {/* Header Action Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Space_Grotesk']">
                            Detection results
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {detections.length} objects
                          </span>
                        </div>
                        <p className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                          {selectedFiles[0]?.name || 'a-try-1.jpeg'} &bull; 05 Sep 2026 at 12:08 PM
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleExportCSV}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>Report</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    {/* View Switcher: Detected image vs Original image */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setAnalysisViewMode('detected')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${analysisViewMode === 'detected'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                          }`}
                      >
                        Detected image
                      </button>
                      <button
                        onClick={() => setAnalysisViewMode('original')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${analysisViewMode === 'original'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                          }`}
                      >
                        Original image
                      </button>
                    </div>

                    {/* Main Sonar Viewport with Interactive Bounding Box */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-16/9 max-h-[320px]">
                      <img
                        src="/sonar-tile-3.jpg"
                        alt="Acoustic detection inspection"
                        className="w-full h-full object-cover select-none"
                      />

                      {/* Bounding Box 1: Ghost Net or Container */}
                      {analysisViewMode === 'detected' && (
                        <>
                          <div
                            onClick={() => setSelectedDetectionId('DET-001')}
                            className={`absolute border-2 transition-all cursor-pointer ${selectedDetectionId === 'DET-001'
                              ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                              : 'border-blue-500 bg-blue-500/10'
                              }`}
                            style={{ top: '24%', left: '46%', width: '22%', height: '34%' }}
                          >
                            <span className="absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-white shadow-xs">
                              1. Sunken Container &bull; 88%
                            </span>
                          </div>

                          <div
                            onClick={() => setSelectedDetectionId('DET-002')}
                            className={`absolute border-2 transition-all cursor-pointer ${selectedDetectionId === 'DET-002'
                              ? 'border-rose-400 bg-rose-400/10 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                              : 'border-rose-500 bg-rose-500/10'
                              }`}
                            style={{ top: '65%', left: '20%', width: '18%', height: '22%' }}
                          >
                            <span className="absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500 text-white shadow-xs">
                              2. Ghost Net &bull; 93%
                            </span>
                          </div>
                        </>
                      )}

                      {/* Acoustic Nadir Line indicator */}
                      <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-cyan-400/40 border-r border-dashed border-cyan-200/50"></div>
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.2 rounded bg-black/70 text-cyan-300 font-mono text-[9px]">
                        NADIR TRACK &bull; SSS 900 kHz
                      </div>
                    </div>

                    {/* Detected Object Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {detections.map(d => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDetectionId(d.id)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${selectedDetectionId === d.id
                            ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9.5px] font-mono font-bold text-slate-500">
                              {d.id}
                            </span>
                            <span
                              className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded"
                              style={{ color: d.color, backgroundColor: `${d.color}15` }}
                            >
                              {d.confidence}%
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{d.type}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{d.lat}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedMapSurvey}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>
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
      {isReportModalOpen && (
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
      )}
      {/* Supported Formats Modal */}
      {isSupportedFormatsModalOpen && (
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
