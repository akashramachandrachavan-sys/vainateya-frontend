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
  Locate
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

  // Map references
  const dashMapRef = useRef<HTMLDivElement | null>(null);
  const dashMapInstance = useRef<L.Map | null>(null);
  const fullMapRef = useRef<HTMLDivElement | null>(null);
  const fullMapInstance = useRef<L.Map | null>(null);

  const selectedDetection = detections.find(d => d.id === selectedDetectionId) || detections[0];

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

  // Initialize Full Screen Map
  useEffect(() => {
    if (currentScreen !== 'map') {
      if (fullMapInstance.current) {
        fullMapInstance.current.remove();
        fullMapInstance.current = null;
      }
      return;
    }

    if (!fullMapRef.current) return;

    const map = L.map(fullMapRef.current, {
      center: [15.2, 73.55],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const track: [number, number][] = [
      [15.26, 73.50],
      [15.22, 73.53],
      [15.18, 73.56],
      [15.14, 73.60],
      [15.10, 73.65],
    ];

    L.polyline(track, {
      color: '#2563eb',
      weight: 3,
      opacity: 0.85,
      dashArray: '5, 5',
    }).addTo(map);

    detections.forEach(d => {
      const lat = parseFloat(d.lat);
      const lng = parseFloat(d.lng);
      const markerIcon = L.divIcon({
        className: 'custom-det-marker',
        html: `
          <div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${d.color}; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([lat, lng], { icon: markerIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b>${d.id}</b> - ${d.type}<br/>
            Confidence: <b>${d.confidence}%</b><br/>
            Status: <b>${d.status}</b>
          </div>
        `)
        .addTo(map);
    });

    fullMapInstance.current = map;

    return () => {
      if (fullMapInstance.current) {
        fullMapInstance.current.remove();
        fullMapInstance.current = null;
      }
    };
  }, [currentScreen, detections]);

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
              onClick={() => setIsReportModalOpen(true)}
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
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveys, locations, or detections..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Right Header: Notification Bell & Profile Avatar */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>

            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
          <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Header Greeting & Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                  Welcome back, Akash!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Monitor surveys, review detections, and contribute to cleaner oceans.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                Tue, 23 Sep 2025
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Surveys */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Total Surveys</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    12
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                    &uarr; +3 this month
                  </div>
                </div>
              </div>

              {/* 2. Total Detections */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Crosshair className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Total Detections</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    86
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                    &uarr; +21 this month
                  </div>
                </div>
              </div>

              {/* 3. High Priority */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">High Priority</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    4
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Needs review
                  </div>
                </div>
              </div>

              {/* 4. Processed */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Processed</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    8
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    67% completed
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Survey Locations Map (Left) & Recent Surveys (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column (7 cols): Survey Locations Map Card */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Survey Locations
                    </h2>
                    <p className="text-xs text-slate-500">
                      Overview of all survey areas and detected anomalies.
                    </p>
                  </div>

                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <span>All Surveys</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Map Viewport */}
                <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-200">
                  <div ref={dashMapRef} className="w-full h-full z-0"></div>

                  {/* Top-Right Map Controls */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1 bg-white rounded-lg border border-slate-200 shadow-sm p-0.5">
                    <button
                      onClick={() => dashMapInstance.current?.zoomIn()}
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      onClick={() => dashMapInstance.current?.zoomOut()}
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      &minus;
                    </button>
                    <button
                      onClick={() => dashMapInstance.current?.setView([16.4, 72.8], 7)}
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      title="Center Map"
                    >
                      <Locate className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Geographic Watermarks on Map */}
                  <div className="absolute top-1/2 left-8 -translate-y-1/2 text-white/50 font-['Space_Grotesk'] font-bold text-sm tracking-widest italic pointer-events-none drop-shadow-sm select-none">
                    Arabian Sea
                  </div>
                  <div className="absolute top-1/3 right-8 text-white/70 font-semibold text-xs tracking-wider pointer-events-none drop-shadow-sm select-none">
                    Maharashtra
                  </div>
                  <div className="absolute bottom-1/4 right-12 text-white/70 font-semibold text-xs tracking-wider pointer-events-none drop-shadow-sm select-none">
                    Goa
                  </div>

                  {/* Bottom-Left Legend */}
                  <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[11px] space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span>Survey Location</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span>High Priority Detection</span>
                    </div>
                  </div>

                  {/* Bottom-Right Scale Bar */}
                  <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-600 shadow-sm">
                    100 km
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Recent Surveys */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                    Recent Surveys
                  </h2>
                  <button
                    onClick={() => setCurrentScreen('surveys')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 space-y-1">
                  {/* Survey 1 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(4);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src="/sonar-tile-1.jpg"
                        alt="Arabian Sea Survey"
                        className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Arabian Sea Survey
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          23 Sep 2025 &bull; 24 images
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">5 detections</div>
                    </div>
                  </div>

                  {/* Survey 2 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(3);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src="/sonar-tile-2.jpg"
                        alt="Mumbai Coast Survey"
                        className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Mumbai Coast Survey
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          20 Sep 2025 &bull; 18 images
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      Processing
                    </span>
                  </div>

                  {/* Survey 3 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(4);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src="/sonar-tile-3.jpg"
                        alt="Goa Patch Survey"
                        className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Goa Patch Survey
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          18 Sep 2025 &bull; 32 images
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">3 detections</div>
                    </div>
                  </div>

                  {/* Survey 4 */}
                  <div
                    onClick={() => {
                      setCurrentScreen('new-survey');
                      setNewSurveyStep(1);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src="/sonar-survey-sample.png"
                        alt="Ratnagiri Survey"
                        className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:opacity-90"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Ratnagiri Survey
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          14 Sep 2025 &bull; 27 images
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Not Started
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Actions */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                  Quick Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Start a new survey or view results.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Action 1: New Survey */}
                <div
                  onClick={() => {
                    setCurrentScreen('new-survey');
                    setNewSurveyStep(1);
                  }}
                  className="bg-white p-4 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex items-center space-x-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      New Survey
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Upload sonar data
                    </div>
                  </div>
                </div>

                {/* Action 2: View Map */}
                <div
                  onClick={() => setCurrentScreen('map')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex items-center space-x-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      View Map
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Explore detections
                    </div>
                  </div>
                </div>

                {/* Action 3: Generate Report */}
                <div
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex items-center space-x-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      Generate Report
                    </div>
                    <div className="text-[11px] text-slate-500">
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
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex items-center space-x-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      Detection History
                    </div>
                    <div className="text-[11px] text-slate-500">
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
          <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Top Back link */}
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span>&larr; Back to Dashboard</span>
            </button>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                New Survey
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Upload side-scan sonar imagery to detect and classify underwater debris and anomalies.
              </p>
            </div>

            {/* 4-Step Stepper Header (Images 2, 3, 4) */}
            <div className="flex items-center max-w-3xl pt-1 pb-2 text-xs font-mono font-bold">
              {/* Step 1 */}
              <div
                onClick={() => setNewSurveyStep(1)}
                className={`flex items-center space-x-2 cursor-pointer ${newSurveyStep >= 1 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 1
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <span>Survey Details</span>
              </div>

              {/* Line 1-2 */}
              <div
                className={`flex-1 h-0.5 mx-3 ${newSurveyStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 2 */}
              <div
                onClick={() => setNewSurveyStep(2)}
                className={`flex items-center space-x-2 cursor-pointer ${newSurveyStep >= 2 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 2
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <span>Upload Data</span>
              </div>

              {/* Line 2-3 */}
              <div
                className={`flex-1 h-0.5 mx-3 ${newSurveyStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 3 */}
              <div
                onClick={() => setNewSurveyStep(3)}
                className={`flex items-center space-x-2 cursor-pointer ${newSurveyStep >= 3 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 3
                    ? 'bg-blue-600 text-white'
                    : newSurveyStep === 3
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {newSurveyStep > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                </div>
                <span>Processing</span>
              </div>

              {/* Line 3-4 */}
              <div
                className={`flex-1 h-0.5 mx-3 ${newSurveyStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`}
              ></div>

              {/* Step 4 */}
              <div
                onClick={() => setNewSurveyStep(4)}
                className={`flex items-center space-x-2 cursor-pointer ${newSurveyStep === 4 ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${newSurveyStep === 4
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Left Box: Survey Information */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Survey Information
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Provide basic details about the survey.
                        </p>
                      </div>

                      {/* Survey Name */}
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Survey Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={surveyName}
                          onChange={e => setSurveyName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      {/* Survey Date & Survey Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Survey Date <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="date"
                              value={surveyDate}
                              onChange={e => setSurveyDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Survey Area / Location
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={surveyLocation}
                              onChange={e => setSurveyLocation(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                            />
                            {surveyLocation && (
                              <button
                                onClick={() => setSurveyLocation('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                            Description (Optional)
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {surveyDescription.length}/500
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={surveyDescription}
                          maxLength={500}
                          onChange={e => setSurveyDescription(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Why these details note */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start space-x-3 mt-4">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-blue-900">Why these details?</h5>
                        <p className="text-[11px] text-blue-700/90 leading-normal mt-0.5">
                          Survey information helps in organizing data, mapping detections, and generating accurate reports.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Upload Side-Scan Sonar Data */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Upload Side-Scan Sonar Data
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Upload one or multiple sonar image files for analysis.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSupportedFormatsModalOpen(true)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors cursor-pointer"
                        >
                          <Info className="w-3 h-3 text-blue-600" />
                          <span>Supported Formats</span>
                        </button>
                      </div>

                      {/* Dropzone Box */}
                      <div
                        onClick={handleAddFiles}
                        className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer space-y-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          Drag &amp; drop sonar images here
                        </div>
                        <div className="text-[11px] text-slate-400">or</div>
                        <button
                          type="button"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Browse Files
                        </button>
                        <p className="text-[10.5px] font-mono text-slate-400 pt-1">
                          PNG, JPEG, TIFF, or BMP &bull; Up to 25 MB per file &bull; Multiple files allowed
                        </p>
                      </div>

                      {/* Selected Files List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                            Selected Files ({selectedFiles.length})
                          </span>
                          {selectedFiles.length > 0 && (
                            <button
                              onClick={() => setSelectedFiles([])}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate font-mono">
                                    {file.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {file.size}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Buttons Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      if (selectedFiles.length === 0) setSelectedFiles(defaultFilesList);
                      setNewSurveyStep(2);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Next: Upload Data</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: UPLOAD DATA & BATCH PREVIEW (Image 3) */}
            {/* ------------------------------------------------------------- */}
            {newSurveyStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column (5 cols): Upload Box & Selected Files (5) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Upload Side-Scan Sonar Data
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select one or multiple sonar image files for analysis.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSupportedFormatsModalOpen(true)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-blue-600" />
                        <span>Supported Formats</span>
                      </button>
                    </div>

                    {/* Dropzone */}
                    <div
                      onClick={handleAddFiles}
                      className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-5 text-center bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        Drag &amp; drop sonar images here
                      </div>
                      <div className="text-[11px] text-slate-400">or</div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Browse Files
                      </button>
                      <p className="text-[10px] font-mono text-slate-400 pt-1">
                        PNG, JPEG, TIFF, or BMP &bull; Up to 25 MB per file &bull; Multiple files allowed
                      </p>
                    </div>

                    {/* Selected Files List (5) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                          Selected Files ({selectedFiles.length})
                        </span>
                        {selectedFiles.length > 0 && (
                          <button
                            onClick={() => setSelectedFiles([])}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {selectedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate font-mono">
                                  {file.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {file.size}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (7 cols): Batch Preview (5 images selected) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                            Batch Preview
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {selectedFiles.length} images selected
                          </p>
                        </div>

                        {/* View Mode Toggle: Grid View vs List View */}
                        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                          <button
                            onClick={() => setBatchViewMode('grid')}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${batchViewMode === 'grid'
                              ? 'bg-white text-blue-700 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            <Grid className="w-3.5 h-3.5" />
                            <span>Grid View</span>
                          </button>
                          <button
                            onClick={() => setBatchViewMode('list')}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${batchViewMode === 'list'
                              ? 'bg-white text-blue-700 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>List View</span>
                          </button>
                        </div>
                      </div>

                      {/* Previews: 3x2 Grid */}
                      {batchViewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group"
                            >
                              <div className="h-28 sm:h-32 w-full overflow-hidden relative">
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px]">
                                  {file.size}
                                </div>
                              </div>
                              <div className="p-2 bg-white border-t border-slate-100">
                                <div className="text-[11px] font-mono font-bold text-slate-800 truncate">
                                  {file.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={file.thumbnail}
                                  alt={file.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                                <div>
                                  <div className="text-xs font-bold font-mono text-slate-900">
                                    {file.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {file.size} &bull; Ready for inference
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips for best results */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-start space-x-3 mt-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-blue-900">Tips for best results</h5>
                          <ul className="text-[11px] text-blue-800/80 space-y-0.5 list-disc pl-4">
                            <li>Use clear, high-resolution side-scan sonar images.</li>
                            <li>Ensure images are correctly oriented (port-starboard).</li>
                            <li>For large surveys, you can upload multiple files at once.</li>
                            <li>Supported formats: PNG, JPEG, TIFF, BMP. Maximum size: 25 MB per file.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setNewSurveyStep(1)}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        onClick={() => setNewSurveyStep(3)}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                      >
                        <span>Start Processing</span>
                        <ArrowRight className="w-4 h-4" />
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column (7 cols): Pipeline Checklist & Progress */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Space_Grotesk']">
                            Processing Sonar Images
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Analyzing your sonar data using AI to detect and classify underwater objects.
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedFiles.length || 5} images
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">
                            {isProcessingComplete
                              ? '5 of 5 images processed'
                              : '3 of 5 images processed'}
                          </span>
                          <span className="font-mono font-bold text-blue-600">
                            {processingProgress}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* 5-Stage Checklist */}
                      <div className="space-y-3 pt-1">
                        {/* 1. Data Validation */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                1. Data Validation
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Checking file format, resolution, and integrity.
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Completed 00:00:05
                          </span>
                        </div>

                        {/* 2. Image Preprocessing */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                2. Image Preprocessing
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Noise filtering and enhancement.
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Completed 00:00:18
                          </span>
                        </div>

                        {/* 3. AI Detection & Classification */}
                        <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-200 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {isProcessingComplete || activeStage > 3 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <RotateCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-blue-900">
                                3. AI Detection &amp; Classification
                              </h4>
                              <p className="text-[11px] text-blue-700/80 mt-0.5">
                                Identifying potential marine debris and anomalies.
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${isProcessingComplete || activeStage > 3
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                          >
                            {isProcessingComplete || activeStage > 3 ? 'Completed 00:01:12' : 'Processing 00:01:12'}
                          </span>
                        </div>

                        {/* 4. Geospatial Localization */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {isProcessingComplete || activeStage >= 4 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                4. Geospatial Localization
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Mapping detections to geographic coordinates.
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {isProcessingComplete || activeStage >= 4 ? 'Completed 00:00:20' : 'Pending --:--'}
                          </span>
                        </div>

                        {/* 5. Generating Results */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {isProcessingComplete || activeStage >= 5 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                5. Generating Results
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Compiling analysis results and visualizations.
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {isProcessingComplete || activeStage >= 5 ? 'Completed 00:00:08' : 'Pending --:--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Alert and Cancel */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-start space-x-2 text-[11px] text-slate-500 leading-tight">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          Please keep this page open. Processing may take a few minutes. You will be automatically redirected once complete.
                        </span>
                      </div>

                      {isProcessingComplete ? (
                        <button
                          onClick={() => setNewSurveyStep(4)}
                          className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>View Results</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setNewSurveyStep(2)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer"
                        >
                          <StopCircle className="w-4 h-4" />
                          <span>Cancel Processing</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column (5 cols): Current Image Scanning & Live Statistics */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Current Image
                        </h2>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {isProcessingComplete ? '5 / 5' : '3 / 5'}
                        </span>
                      </div>

                      {/* Active Sonar Waterfall Box with Scanning Laser HUD */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-4/3">
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
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-cyan-400 font-mono text-[10px] border border-cyan-500/30 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                          <span>YOLOv12 SSS SCANNER</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
                        <span className="font-bold text-slate-800">sonar_003.tif</span>
                        <span className="text-blue-600 font-bold">
                          {isProcessingComplete ? 'Complete' : 'Processing...'}
                        </span>
                      </div>
                    </div>

                    {/* Live Statistics */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                        Live Statistics
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Images Processed</span>
                          </span>
                          <span className="font-bold font-mono text-slate-900">
                            {isProcessingComplete ? '5 / 5' : '3 / 5'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-2">
                            <Crosshair className="w-3.5 h-3.5 text-purple-600" />
                            <span>Potential Detections</span>
                          </span>
                          <span className="font-bold font-mono text-purple-600">12</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500 flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Elapsed Time</span>
                          </span>
                          <span className="font-bold font-mono text-slate-900">
                            {Math.floor(elapsedSeconds / 60)
                              .toString()
                              .padStart(2, '0')}
                            :{(elapsedSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-500 flex items-center space-x-2">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Processing Speed</span>
                          </span>
                          <span className="font-bold font-mono text-emerald-600">
                            ~ 6.2 sec/image
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (5 cols): Upload SSS Image & Survey Position */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Upload SSS image card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Upload SSS image
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          PNG, JPEG, TIFF, or BMP survey frame
                        </p>
                      </div>

                      <div
                        onClick={() => setNewSurveyStep(2)}
                        className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer space-y-1.5"
                      >
                        <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                        <div className="text-xs font-bold text-slate-800">
                          Drop an SSS image here, or click to browse
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          PNG, JPEG, TIFF, or BMP &bull; up to 25.00 MB
                        </p>
                      </div>
                    </div>

                    {/* Survey Position mini map card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                          Survey position
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">
                          {selectedDetection.lat}, {selectedDetection.lng}
                        </span>
                      </div>

                      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src="/sonar-tile-2.jpg"
                          alt="Survey position bathymetry"
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/90 text-[10px] font-mono text-slate-700 shadow-xs">
                          Visakhapatnam / Goa Coast
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
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
                    {/* Header Action Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                            Detection results
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {detections.length} objects detected
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {selectedFiles[0]?.name || 'a-try-1.jpeg'} &bull; 05 Sep 2026 at 12:08 PM
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleExportCSV}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download image report</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print / Save PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* View Switcher: Detected image vs Original image */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setAnalysisViewMode('detected')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${analysisViewMode === 'detected'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                          }`}
                      >
                        Detected image
                      </button>
                      <button
                        onClick={() => setAnalysisViewMode('original')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${analysisViewMode === 'original'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                          }`}
                      >
                        Original image
                      </button>
                    </div>

                    {/* Main Sonar Viewport with Interactive Bounding Box */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-16/10">
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
                            <span className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-white shadow-xs">
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
                            <span className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white shadow-xs">
                              2. Ghost Net &bull; 93%
                            </span>
                          </div>
                        </>
                      )}

                      {/* Acoustic Nadir Line indicator */}
                      <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-cyan-400/40 border-r border-dashed border-cyan-200/50"></div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-cyan-300 font-mono text-[9.5px]">
                        NADIR TRACK &bull; SSS 900 kHz
                      </div>
                    </div>

                    {/* Detected Object Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {detections.map(d => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDetectionId(d.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedDetectionId === d.id
                            ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              {d.id}
                            </span>
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                              style={{ color: d.color, backgroundColor: `${d.color}15` }}
                            >
                              {d.confidence}%
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{d.type}</h4>
                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">{d.lat}</p>
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
        {/* SCREEN: FULL MAP VIEW */}
        {/* ========================================================= */}
        {currentScreen === 'map' && (
          <main className="p-6 sm:p-8 space-y-4 max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Geospatial Map View
                </h1>
                <p className="text-xs text-slate-500">
                  Interactive GIS map with ship survey tracks and classified anomaly coordinates.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentScreen('new-survey');
                  setNewSurveyStep(1);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                + New Survey
              </button>
            </div>

            <div className="flex-1 min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
              <div ref={fullMapRef} className="w-full h-full z-0"></div>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN: SURVEYS LIST */}
        {/* ========================================================= */}
        {currentScreen === 'surveys' && (
          <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Survey Catalog
                </h1>
                <p className="text-xs text-slate-500">
                  All processed hydrographic and side-scan sonar surveys.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentScreen('new-survey');
                  setNewSurveyStep(1);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                + Ingest New Survey
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Survey Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Images</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Arabian Sea Survey</td>
                    <td className="p-4 text-slate-600">Maharashtra Shelf</td>
                    <td className="p-4 font-mono text-slate-500">23 Sep 2025</td>
                    <td className="p-4 font-mono text-slate-600">24 images</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setCurrentScreen('new-survey');
                          setNewSurveyStep(4);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Open Studio &rarr;
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Mumbai Coast Survey</td>
                    <td className="p-4 text-slate-600">Offshore Channel</td>
                    <td className="p-4 font-mono text-slate-500">20 Sep 2025</td>
                    <td className="p-4 font-mono text-slate-600">18 images</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200">
                        Processing
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setCurrentScreen('new-survey');
                          setNewSurveyStep(3);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        View Live &rarr;
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Goa Patch Survey</td>
                    <td className="p-4 text-slate-600">Mormugao Port Approach</td>
                    <td className="p-4 font-mono text-slate-500">18 Sep 2025</td>
                    <td className="p-4 font-mono text-slate-600">32 images</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setCurrentScreen('new-survey');
                          setNewSurveyStep(4);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Open Studio &rarr;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* SCREEN: SETTINGS */}
        {/* ========================================================= */}
        {currentScreen === 'settings' && (
          <main className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto w-full">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                System &amp; Pipeline Settings
              </h1>
              <p className="text-xs text-slate-500">
                Configure inference confidence thresholds, coordinate reference systems, and storage buckets.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 text-xs">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  AI Model Confidence Threshold: 75%
                </label>
                <input
                  type="range"
                  min="40"
                  max="95"
                  defaultValue="75"
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Acoustic Shadow Verification Filter</div>
                  <div className="text-slate-500 text-[11px]">
                    Reject targets missing acoustic shadow geometry
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Cloudflare R2 Object Storage</div>
                  <div className="text-slate-500 text-[11px]">Connected: vainateya-sonar-swaths</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono">
                  Online
                </span>
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
