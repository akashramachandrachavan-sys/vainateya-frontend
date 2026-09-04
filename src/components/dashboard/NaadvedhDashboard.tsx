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
  Waves,
  Sparkles,
  RotateCw,
  Check,
  CheckCircle,
  XCircle,
  Edit3,
  MessageSquarePlus,
  FileCode2,
  Trash2
} from 'lucide-react';

// Navigation Screens for the MVP Flow
export type DashboardScreen = 'dashboard' | 'new-survey' | 'processing' | 'analysis' | 'map';

export interface DetectionItem {
  id: string;
  type: 'Fishing Gear' | 'Debris' | 'Unknown';
  confidence: number;
  lat: string;
  lng: string;
  color: string;
  status: 'Confirmed' | 'Pending Review' | 'Rejected';
  operatorNote?: string;
  box: { top: string; left: string; width: string; height: string };
}

const initialDetections: DetectionItem[] = [
  {
    id: 'DET-001',
    type: 'Fishing Gear',
    confidence: 93,
    lat: '15.1234° N',
    lng: '73.5432° E',
    color: '#ef4444', // Red
    status: 'Confirmed',
    operatorNote: 'Suspected ghost net snagged on rocky outcrop',
    box: { top: '35%', left: '22%', width: '22%', height: '26%' },
  },
  {
    id: 'DET-002',
    type: 'Debris',
    confidence: 88,
    lat: '15.1278° N',
    lng: '73.5489° E',
    color: '#3b82f6', // Blue
    status: 'Pending Review',
    operatorNote: 'Metallic container acoustic signature with clear shadow',
    box: { top: '50%', left: '60%', width: '18%', height: '22%' },
  },
  {
    id: 'DET-003',
    type: 'Unknown',
    confidence: 64,
    lat: '15.1301° N',
    lng: '73.5512° E',
    color: '#10b981', // Green
    status: 'Pending Review',
    operatorNote: 'Acoustic anomaly near seabed transition zone',
    box: { top: '65%', left: '34%', width: '16%', height: '18%' },
  },
];

export const NaadvedhDashboard: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [analysisViewMode, setAnalysisViewMode] = useState<'original' | 'ai' | 'side-by-side'>('ai');

  // Detections state with operator verification capabilities
  const [detections, setDetections] = useState<DetectionItem[]>(initialDetections);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>(initialDetections[0].id);

  // New Survey Form State
  const [surveyName, setSurveyName] = useState<string>('Arabian Sea Survey - Block 04');
  const [surveyLocation, setSurveyLocation] = useState<string>('Goa Coast');
  const [surveyDate, setSurveyDate] = useState<string>('2024-11-24');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>({
    name: 'goa_survey.xtf',
    size: '1.2 GB',
  });

  // Processing Animation State
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isProcessingComplete, setIsProcessingComplete] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(1);

  // Inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Map reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const selectedDetection = detections.find(d => d.id === selectedDetectionId) || detections[0];

  // Auto-progress simulation in Processing screen
  useEffect(() => {
    if (currentScreen !== 'processing') return;

    // Reset progress
    const t0 = setTimeout(() => {
      setProcessingProgress(15);
      setActiveStage(1);
      setIsProcessingComplete(false);
    }, 100);

    const t1 = setTimeout(() => {
      setProcessingProgress(45);
      setActiveStage(2);
    }, 700);

    const t2 = setTimeout(() => {
      setProcessingProgress(78);
      setActiveStage(3);
    }, 1400);

    const t3 = setTimeout(() => {
      setProcessingProgress(92);
      setActiveStage(4);
    }, 2100);

    const t4 = setTimeout(() => {
      setProcessingProgress(100);
      setIsProcessingComplete(true);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }, 2800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentScreen]);

  // Initialize Map when switching to Map screen
  useEffect(() => {
    if (currentScreen !== 'map') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Center on Goa / Arabian Sea coastline
    const map = L.map(mapContainerRef.current, {
      center: [15.18, 73.58],
      zoom: 11,
      zoomControl: true,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Ship survey track line (blue polyline)
    const trackPoints: [number, number][] = [
      [15.26, 73.50],
      [15.22, 73.53],
      [15.18, 73.56],
      [15.14, 73.60],
      [15.10, 73.65],
      [15.06, 73.70],
    ];

    L.polyline(trackPoints, {
      color: '#0284c7',
      weight: 3,
      opacity: 0.85,
      dashArray: '6, 6',
    }).addTo(map);

    // Track Waypoints
    trackPoints.forEach(pt => {
      const dotIcon = L.divIcon({
        className: 'custom-track-dot',
        html: `<div style="width: 8px; height: 8px; background: #0284c7; border: 1.5px solid white; border-radius: 50%;"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });
      L.marker(pt, { icon: dotIcon }).addTo(map);
    });

    // Add Debris Markers
    detections.forEach(d => {
      const latNum = parseFloat(d.lat);
      const lngNum = parseFloat(d.lng);

      const markerIcon = L.divIcon({
        className: 'custom-debris-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${d.color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${d.color}; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #0f172a;">${d.type}</span>
            <span style="font-size: 11px; font-weight: bold; color: ${d.color}; background: #f1f5f9; padding: 2px 6px; border-radius: 9999px;">${d.confidence}%</span>
          </div>
          <div style="font-size: 11px; color: #64748b; font-family: monospace; line-height: 1.4; margin-bottom: 6px;">
            Lat: ${d.lat}<br/>Lng: ${d.lng}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: ${d.status === 'Confirmed' ? '#15803d' : d.status === 'Rejected' ? '#b91c1c' : '#854d0e'}; margin-bottom: 8px;">
            Status: ${d.status}
          </div>
          <button id="popup-btn-${d.id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
            View in Analysis Studio &rarr;
          </button>
        </div>
      `;

      const marker = L.marker([latNum, lngNum], { icon: markerIcon }).addTo(map);
      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${d.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedDetectionId(d.id);
            setCurrentScreen('analysis');
          };
        }
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentScreen, detections]);

  // Operator Verification Handlers
  const handleUpdateStatus = (id: string, newStatus: 'Confirmed' | 'Pending Review' | 'Rejected') => {
    setDetections(prev =>
      prev.map(d => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleCycleClass = (id: string) => {
    const classOrder: ('Fishing Gear' | 'Debris' | 'Unknown')[] = ['Fishing Gear', 'Debris', 'Unknown'];
    const colorMap = {
      'Fishing Gear': '#ef4444',
      'Debris': '#3b82f6',
      'Unknown': '#10b981',
    };

    setDetections(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const currentIndex = classOrder.indexOf(d.type);
        const nextType = classOrder[(currentIndex + 1) % classOrder.length];
        return {
          ...d,
          type: nextType,
          color: colorMap[nextType],
        };
      })
    );
  };

  const handleSaveNote = (id: string) => {
    setDetections(prev =>
      prev.map(d => (d.id === id ? { ...d, operatorNote: noteText } : d))
    );
    setEditingNoteId(null);
    setNoteText('');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = [
      ['Survey Name', surveyName],
      ['Date', surveyDate],
      ['Status', 'Completed'],
      [],
      ['Detection ID', 'Object Class', 'Confidence', 'Latitude', 'Longitude', 'Verification Status', 'Operator Notes'],
      ...detections.map(d => [
        d.id,
        d.type,
        `${d.confidence}%`,
        d.lat,
        d.lng,
        d.status,
        `"${d.operatorNote || ''}"`,
      ]),
      ['DET-004', 'Fishing Gear', '91%', '15.1320° N', '73.5540° E', 'Confirmed', '"Trawl net fragment"'],
      ['DET-005', 'Debris', '85%', '15.1350° N', '73.5570° E', 'Confirmed', '"Submerged metallic drum"'],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VAINATEYA_Survey_Detections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export GeoJSON Handler
  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: detections.map(d => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(d.lng), parseFloat(d.lat)],
        },
        properties: {
          id: d.id,
          class: d.type,
          confidence: d.confidence,
          status: d.status,
          notes: d.operatorNote,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VAINATEYA_Targets_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F3F4F8] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-56 sm:w-60 bg-[#0B1528] text-slate-300 flex flex-col justify-between shrink-0 shadow-xl select-none z-20">
        <div>
          {/* Logo */}
          <div className="p-4 flex items-center space-x-2.5 border-b border-slate-800/80">
            <img
              src="/vainateya-symbol.png"
              alt="VAINATEYA"
              className="w-8 h-8 object-contain bg-white/10 p-1 rounded-lg border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-extrabold text-base text-white font-['Space_Grotesk'] tracking-wider leading-none">
                VAINATEYA
              </h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-tight mt-0.5 truncate italic">
                Perception Beyond Sight
              </p>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="p-3 space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentScreen('analysis')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'analysis' || currentScreen === 'processing'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Surveys</span>
            </button>

            <button
              onClick={() => setCurrentScreen('map')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${currentScreen === 'map'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>

            <button
              onClick={() => alert('Settings: Model threshold = 0.65, WGS84 projection enabled, Cloudflare R2 bucket connected.')}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <a
            href="/auth.html?mode=signin"
            className="flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Bar with Profile */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
              {currentScreen === 'dashboard' && 'Marine Survey Dashboard'}
              {currentScreen === 'new-survey' && 'New Survey & Ingestion'}
              {currentScreen === 'processing' && 'Processing Pipeline'}
              {currentScreen === 'analysis' && 'Analysis Studio'}
              {currentScreen === 'map' && 'Geospatial Map View'}
            </span>

            {/* Realistic System Status Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>API Connected &bull; Processing Worker Ready</span>
            </div>
          </div>

          {/* Profile badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">Akash Chavan</div>
                <div className="text-[10px] font-mono text-slate-500 leading-tight">Marine Operator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Screen 1: Marine Survey Dashboard */}
        {currentScreen === 'dashboard' && (
          <main className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header with Title & + New Survey Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                  Welcome, Akash!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Let's make our oceans cleaner.
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen('new-survey')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Survey</span>
              </button>
            </div>

            {/* 4 KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Surveys */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    12
                  </div>
                  <div className="text-xs font-medium text-slate-500">Total Surveys</div>
                </div>
              </div>

              {/* 2. Total Detections */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    86
                  </div>
                  <div className="text-xs font-medium text-slate-500">Total Detections</div>
                </div>
              </div>

              {/* 3. High Priority Targets */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-['Space_Grotesk']">
                    4
                  </div>
                  <div className="text-xs font-medium text-slate-500">High Priority</div>
                </div>
              </div>

              {/* 4. Processed & Verified */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                    8
                  </div>
                  <div className="text-xs font-medium text-slate-500">Processed</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Recent Surveys (Left) & Quick Actions (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left (2 Cols): Recent Surveys */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                    Recent Surveys
                  </h3>
                  <button
                    onClick={() => setCurrentScreen('analysis')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Survey 1 */}
                  <div
                    onClick={() => setCurrentScreen('analysis')}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Waves className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Arabian Sea Survey
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">24 Nov 2024</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </div>

                  {/* Survey 2 */}
                  <div
                    onClick={() => setCurrentScreen('processing')}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <RotateCw className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Mumbai Coast Survey
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">18 Nov 2024</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                      Processing
                    </span>
                  </div>

                  {/* Survey 3 */}
                  <div
                    onClick={() => setCurrentScreen('analysis')}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Waves className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Goa Patch Survey
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">10 Nov 2024</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Right (1 Col): Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-['Space_Grotesk'] pb-3 border-b border-slate-100">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  {/* Action 1: New Survey */}
                  <div
                    onClick={() => setCurrentScreen('new-survey')}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all flex items-center space-x-3.5 group"
                  >
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        New Survey
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Upload sonar data for analysis
                      </div>
                    </div>
                  </div>

                  {/* Action 2: View Map */}
                  <div
                    onClick={() => setCurrentScreen('map')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer transition-all flex items-center space-x-3.5 group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        View Map
                      </div>
                      <div className="text-[11px] text-slate-500">
                        See detection locations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Screen 2: New Survey / Upload View */}
        {currentScreen === 'new-survey' && (
          <main className="p-6 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                Create New Survey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Upload your side-scan sonar file for analysis.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Survey Name
                </label>
                <input
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder="e.g. Arabian Sea Survey - Block 04"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={surveyLocation}
                  onChange={(e) => setSurveyLocation(e.target.value)}
                  placeholder="e.g. Goa Coast"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sonar File (Single File Primary Flow)
                </label>

                {selectedFile ? (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-600 text-white">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{selectedFile.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{selectedFile.size} &bull; Side-Scan Sonar Format</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setSelectedFile({ name: 'goa_survey.xtf', size: '1.2 GB' })}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-800 mb-1">
                      Drag &amp; drop your sonar file here
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Supports .xtf, .jsf, .tif, .png (Max 2GB)
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen('processing')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Upload &amp; Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Screen 3: Processing Pipeline View */}
        {currentScreen === 'processing' && (
          <main className="p-6 sm:p-8 max-w-xl mx-auto w-full space-y-6 my-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
              {/* Status Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner transition-colors ${isProcessingComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                {isProcessingComplete ? (
                  <Check className="w-9 h-9 stroke-[3]" />
                ) : (
                  <RotateCw className="w-8 h-8 animate-spin" />
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  {isProcessingComplete ? 'Analysis Completed Successfully!' : 'Processing Sonar Waterfall...'}
                </h2>
              </div>

              {/* File Chip */}
              <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">{selectedFile ? selectedFile.name : 'goa_survey.xtf'}</span>
                <span className="text-slate-400">{selectedFile ? selectedFile.size : '1.2 GB'}</span>
              </div>

              {/* Progress Details */}
              <div className="text-left space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isProcessingComplete ? 'Candidate targets extracted' : 'Executing AI pipeline...'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Analyzing acoustic backscatter and shadow geometry
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-600">
                    {processingProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* 4-Stage Architectural Pipeline */}
              <div className="text-left space-y-2.5 pt-2 text-xs font-mono">
                <div className={`flex items-center space-x-2.5 ${activeStage >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${activeStage >= 1 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Storage &amp; Validation &bull; File integrity verified</span>
                </div>

                <div className={`flex items-center space-x-2.5 ${activeStage >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${activeStage >= 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Preprocessing &bull; Noise reduction &amp; contrast CLAHE</span>
                </div>

                <div className={`flex items-center space-x-2.5 ${activeStage >= 3 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                  {activeStage === 3 && !isProcessingComplete ? (
                    <RotateCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${activeStage >= 3 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  )}
                  <span>AI Detection &bull; YOLOv12 acoustic signature inference</span>
                </div>

                <div className={`flex items-center space-x-2.5 ${activeStage >= 4 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {activeStage >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                  )}
                  <span>Verification &amp; Geolocation &bull; Shadow check &amp; WGS84 coordinates</span>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => setCurrentScreen('analysis')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isProcessingComplete ? 'Open Analysis Studio' : 'View Analysis Studio (Live)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        )}

        {/* Screen 4: Analysis Studio (Hero Feature) */}
        {currentScreen === 'analysis' && (
          <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                  {surveyName}
                </h2>
                <span className="text-xs text-slate-400 font-mono">{surveyDate}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>

              {/* View Mode Switcher: Original, AI Overlay, Side-by-Side */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setAnalysisViewMode('original')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${analysisViewMode === 'original' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setAnalysisViewMode('ai')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${analysisViewMode === 'ai' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  AI Overlay
                </button>
                <button
                  onClick={() => setAnalysisViewMode('side-by-side')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${analysisViewMode === 'side-by-side' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Main Studio Grid: Left (Waterfall Sonar Image) & Right (Operator Verification & Detections) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left (7 Cols): Sonar Waterfall Display Canvas */}
              <div className="lg:col-span-7 bg-black rounded-2xl border border-slate-800 overflow-hidden relative shadow-md flex flex-col min-h-[460px]">
                {/* Acoustic Waterfall Simulation Texture */}
                <div className="relative flex-1 w-full h-full bg-[#161208] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      backgroundImage: `
                          radial-gradient(ellipse at 40% 50%, rgba(202, 138, 4, 0.4) 0%, rgba(30, 20, 5, 0.9) 80%),
                          repeating-linear-gradient(0deg, rgba(234, 179, 8, 0.05) 0px, rgba(234, 179, 8, 0.05) 2px, transparent 2px, transparent 4px),
                          repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0px, rgba(0, 0, 0, 0.2) 20px, rgba(202, 138, 4, 0.04) 20px, rgba(202, 138, 4, 0.04) 40px)
                        `,
                    }}
                  ></div>

                  {/* Nadir Blind Zone Centerline */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/80 shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>

                    {/* Mock Acoustic Highlights & Shadows */}
                    <div className="absolute top-[37%] left-[24%] w-16 h-8 bg-amber-400/70 rounded-full blur-[2px]"></div>
                    <div className="absolute top-[39%] left-[32%] w-24 h-12 bg-black/90 rounded-sm"></div>

                    <div className="absolute top-[52%] left-[62%] w-14 h-7 bg-amber-300/80 rounded-md blur-[1px]"></div>
                    <div className="absolute top-[54%] left-[70%] w-20 h-10 bg-black/90"></div>

                    <div className="absolute top-[67%] left-[36%] w-12 h-6 bg-amber-400/60 rounded-full"></div>
                    <div className="absolute top-[69%] left-[42%] w-16 h-8 bg-black/90"></div>
                  </div>

                  {/* AI Bounding Boxes (Shown in AI Overlay or Side-by-Side) */}
                  {analysisViewMode !== 'original' && (
                    <>
                      {detections.map((det) => {
                        const isSelected = selectedDetectionId === det.id;
                        return (
                          <div
                            key={det.id}
                            onClick={() => setSelectedDetectionId(det.id)}
                            className="absolute cursor-pointer transition-all duration-200 group"
                            style={{
                              top: det.box.top,
                              left: det.box.left,
                              width: det.box.width,
                              height: det.box.height,
                              border: `2px solid ${det.color}`,
                              backgroundColor: isSelected ? `${det.color}25` : 'transparent',
                              boxShadow: isSelected ? `0 0 14px ${det.color}` : 'none',
                            }}
                          >
                            <div
                              className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm flex items-center space-x-1"
                              style={{ backgroundColor: det.color }}
                            >
                              <span>{det.type}</span>
                              <span>{det.confidence}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Sonar HUD Info */}
                  <div className="absolute bottom-3 left-4 text-[10px] font-mono text-amber-300/70 pointer-events-none">
                    Side-Scan Sonar Swath &bull; Acoustic Backscatter Waterfall
                  </div>
                </div>
              </div>

              {/* Right (5 Cols): Human-in-the-Loop Operator Verification Panel */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Selected Detection Card */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedDetection.color }}
                        ></span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {selectedDetection.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {selectedDetection.confidence}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                      <div>ID: <span className="font-bold text-slate-800">{selectedDetection.id}</span></div>
                      <div>Coordinates: <span className="font-bold text-slate-800">{selectedDetection.lat}</span></div>
                    </div>

                    {/* Operator Verification Action Bar (Confirm, Reject, Reclassify, Notes) */}
                    <div className="pt-2 border-t border-blue-200/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-semibold uppercase">Operator Verification:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${selectedDetection.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedDetection.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                          }`}>
                          {selectedDetection.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedDetection.id, 'Confirmed')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${selectedDetection.status === 'Confirmed'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedDetection.id, 'Rejected')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${selectedDetection.status === 'Rejected'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCycleClass(selectedDetection.id)}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Cycle Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Class</span>
                        </button>
                      </div>

                      {/* Notes Section */}
                      <div className="pt-1">
                        {editingNoteId === selectedDetection.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add tactical notes for recovery crew..."
                              className="w-full bg-white border border-blue-400 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNote(selectedDetection.id)}
                                className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold cursor-pointer"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNoteId(selectedDetection.id);
                              setNoteText(selectedDetection.operatorNote || '');
                            }}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <span className="truncate italic">
                              {selectedDetection.operatorNote || 'Click to add operator note...'}
                            </span>
                            <MessageSquarePlus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* All Candidate Detections List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 uppercase">
                      <span>All Detections ({detections.length})</span>
                      <span className="text-[10px] text-slate-400">Click to Inspect</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {detections.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDetectionId(d.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedDetectionId === d.id
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                            <span className="text-xs font-bold text-slate-800">{d.type}</span>
                            <span className="text-[10px] font-mono text-slate-500">({d.confidence}%)</span>
                          </div>

                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}>
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Studio Action Buttons: View on Map & Generate Report */}
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentScreen('map')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MapIcon className="w-4 h-4 text-blue-600" />
                    <span>View on Map</span>
                  </button>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Screen 5: Geospatial Map View */}
        {currentScreen === 'map' && (
          <main className="p-6 sm:p-8 space-y-4 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                Detection Locations
              </h2>
              <p className="text-xs text-slate-500">
                Geographic view of all detected objects along survey transects.
              </p>
            </div>

            {/* Map Container */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[480px]">
              {/* Leaflet Mount Target */}
              <div ref={mapContainerRef} className="w-full h-full min-h-[480px]"></div>

              {/* Map Legend (Top Right) */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-md text-xs font-mono z-[1000] space-y-2 pointer-events-auto">
                <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider pb-1 border-b border-slate-200">
                  Map Legend
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-700">Fishing Gear</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-700">Debris</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-700">Unknown</span>
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                  <span className="w-3.5 h-0.5 bg-sky-500"></span>
                  <span className="text-slate-700">Survey Track</span>
                </div>
              </div>

              {/* Scale Badge (Bottom Left) */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 shadow text-[10px] font-mono text-slate-600 z-[1000]">
                Scale: 5 km
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Screen 6: Survey Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                Survey Report
              </h3>
              <div className="text-xs font-mono text-slate-500">
                {surveyName} &bull; {surveyDate}
              </div>
            </div>

            {/* 3 Stat KPI Boxes: Total Detections 12, High Priority 4, Confirmed Targets */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-center">
                <div className="text-xl font-extrabold text-blue-700 font-['Space_Grotesk']">12</div>
                <div className="text-[10px] font-medium text-slate-600">Total Detections</div>
              </div>

              <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 text-center">
                <div className="text-xl font-extrabold text-rose-600 font-['Space_Grotesk']">4</div>
                <div className="text-[10px] font-medium text-slate-600">High Priority</div>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-center">
                <div className="text-xl font-extrabold text-emerald-700 font-['Space_Grotesk']">
                  {detections.filter(d => d.status === 'Confirmed').length + 8}
                </div>
                <div className="text-[10px] font-medium text-slate-600">Confirmed</div>
              </div>
            </div>

            {/* Detections Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {detections.map(d => (
                    <tr key={d.id}>
                      <td className="p-2 font-bold text-slate-800">{d.id}</td>
                      <td className="p-2">{d.type}</td>
                      <td className="p-2">{d.confidence}%</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${d.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons: Download PDF, Export CSV, Export GeoJSON */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleExportGeoJSON}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  <span>Export GeoJSON</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400 font-mono">
              Includes detection summary, coordinates, and images.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
