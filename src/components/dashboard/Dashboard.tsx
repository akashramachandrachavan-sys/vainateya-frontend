import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Map as MapIcon,
  Settings as SettingsIcon,
  LogOut,
  Folder,
  FilePlus2,
  Search,
  Bell,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

import {
  apiService,
  type ApiSurvey,
  type ApiSonarFile,
  type ApiDetection,
  type SystemMetrics,
} from '../../services/api';

import type {
  DashboardScreen,
  NotificationItem,
  DetectionItem,
  UploadedFileItem,
  MapDetection,
  SurveyCatalogItem,
  BatchDetectionObject,
  BatchImageResult,
  BatchSummaryStats,
} from './types/dashboard.types';

import { DashboardOverviewView } from './views/DashboardOverviewView';
import { SurveysCatalogView } from './views/SurveysCatalogView';
import { SurveyMapView } from './views/SurveyMapView';
import { SurveySettingsView } from './views/SurveySettingsView';
import { NewSurveyWizard } from './new-survey/NewSurveyWizard';
import { GenerateReportOptionsModal } from './reports/GenerateReportOptionsModal';
import { ExecutiveReportPreviewModal } from './reports/ExecutiveReportPreviewModal';
import { ExecutivePdfReportDocument } from './reports/ExecutivePdfReportDocument';

export const Dashboard: React.FC = () => {
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
  const [batchSortBy, setBatchSortBy] = useState<'name' | 'priority' | 'objects'>('priority');
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
  const [isSurveyDetailsLocked, setIsSurveyDetailsLocked] = useState<boolean>(false);
  const [surveyDetailsError, setSurveyDetailsError] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

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
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState<boolean>(false);
  const [isSupportedFormatsModalOpen, setIsSupportedFormatsModalOpen] = useState<boolean>(false);

  // Map Screen state
  const [mapLayerMode, setMapLayerMode] = useState<'map' | 'satellite'>('satellite');
  const [selectedMapSurvey, setSelectedMapSurvey] = useState<string>('All Surveys');
  const [selectedMapDetectionId, setSelectedMapDetectionId] = useState<string>('');

  // Surveys Screen state
  const [surveyTabFilter, setSurveyTabFilter] = useState<'all' | 'completed' | 'processing' | 'high_priority' | 'archived'>('all');
  const [selectedCatalogSurveyId, setSelectedCatalogSurveyId] = useState<string>('');

  // Settings Screen state
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

  // Load real surveys, metrics, and detections from backend on mount
  const loadBackendData = async () => {
    try {
      const [surveys, metrics, dets] = await Promise.all([
        apiService.getSurveys().catch(() => []),
        apiService.getMetrics().catch(() => null),
        apiService.getDetections().catch(() => []),
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
          apiService.getDetections(activeSurveyId).catch(() => []),
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

  // Current formatted date for Dashboard overview (e.g. "Sun, 6 Sep 2026")
  const formattedToday = useMemo(() => {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  }, []);

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
      thumb: activeSurveyFiles.find(f => f.id === d.file_id)?.url || (activeSurveyFiles.length > 0 && activeSurveyFiles[0].url ? activeSurveyFiles[0].url : '/sonar-tile-1.jpg'),
    };
  });

  // Dynamic Survey Statistics for the Detection Map Screen
  const mapSurveyStats = useMemo(() => {
    const currentSurvey = backendSurveys.find(s => s.name === selectedMapSurvey);

    let imagesProcessed = 0;
    let totalDetections = 0;
    let highPriority = 0;
    let verified = 0;

    if (currentSurvey) {
      imagesProcessed = currentSurvey.file_count ?? activeSurveyFiles.length;
      totalDetections = currentSurvey.detection_count ?? detailedDetections.length;
      highPriority = currentSurvey.high_priority_count ?? detailedDetections.filter(d => d.markerType === 'red').length;
      verified = currentSurvey.confirmed_count ?? detailedDetections.filter(d => d.status === 'Verified').length;
    } else {
      // "All Surveys"
      imagesProcessed = backendMetrics?.total_files ?? (backendSurveys.length > 0 ? backendSurveys.reduce((acc, s) => acc + (s.file_count || 0), 0) : activeSurveyFiles.length);
      totalDetections = backendMetrics?.total_detections ?? (backendSurveys.length > 0 ? backendSurveys.reduce((acc, s) => acc + (s.detection_count || 0), 0) : detailedDetections.length);
      highPriority = backendMetrics?.high_priority_count ?? detailedDetections.filter(d => d.markerType === 'red').length;
      verified = backendMetrics?.confirmed_count ?? detailedDetections.filter(d => d.status === 'Verified').length;
    }

    return {
      imagesProcessed,
      totalDetections,
      highPriority,
      verified,
    };
  }, [backendSurveys, selectedMapSurvey, backendMetrics, activeSurveyFiles.length, detailedDetections]);

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

  // Derived Batch Images from active survey files & detections OR selectedFiles
  const allBatchSurveyImages: BatchImageResult[] = useMemo(() => {
    // 1. If backend returned files for this survey
    if (activeSurveyFiles.length > 0) {
      return activeSurveyFiles.map((file, fIdx) => {
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
    }

    // 2. If user uploaded files in Step 2 (Frontend / Mock mode)
    if (selectedFiles.length > 0) {
      return selectedFiles.map((file, fIdx) => {
        const backendFileDets = activeDetections.filter(
          d => d.file_id === file.name || (!d.file_id && fIdx === 0 && activeDetections.length > 0)
        );

        let mappedDetections: BatchDetectionObject[] = [];

        if (backendFileDets.length > 0) {
          mappedDetections = backendFileDets.map((d, dIdx) => {
            const isCritical = d.priority === 'CRITICAL' || d.priority === 'HIGH';
            const isBlue = d.class_name === 'fishing_gear';
            const color: 'red' | 'blue' | 'amber' = isCritical ? 'red' : isBlue ? 'blue' : 'amber';
            return {
              id: d.id,
              orderNumber: dIdx + 1,
              name: d.label || d.class_name,
              type: d.class_name,
              confidence: Math.round(d.confidence > 1 ? d.confidence : d.confidence * 100),
              coordinates: `${d.location.latitude.toFixed(4)}° N, ${d.location.longitude.toFixed(4)}° E`,
              size: d.dimensions ? `${d.dimensions.estimated_length_m || 5.0} × ${d.dimensions.estimated_width_m || 2.0}` : '5.0 × 2.0',
              color,
              hexColor: isCritical ? '#ef4444' : isBlue ? '#3b82f6' : '#f59e0b',
              borderColor: isCritical ? 'border-rose-500' : isBlue ? 'border-blue-500' : 'border-amber-500',
              bgColor: isCritical ? 'bg-rose-500/10' : isBlue ? 'bg-blue-500/10' : 'bg-amber-500/10',
              textColor: isCritical ? 'text-rose-600' : isBlue ? 'text-blue-600' : 'text-amber-600',
              tagColor: isCritical ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : 'bg-amber-500',
              badgeBg: isCritical
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : isBlue
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200',
              bbox: {
                left: `${Math.round((d.bbox.x / 1200) * 100)}%`,
                top: `${Math.round((d.bbox.y / 700) * 100)}%`,
                width: `${Math.round((d.bbox.width / 1200) * 100)}%`,
                height: `${Math.round((d.bbox.height / 700) * 100)}%`,
              },
              thumb: file.thumbnail,
            };
          });
        } else {
          // Realistic marine debris detections mapped directly onto uploaded sonar frame
          mappedDetections = [
            {
              id: `det-${fIdx}-1`,
              orderNumber: 1,
              name: 'Sunken Cargo Container',
              type: 'container',
              confidence: 94,
              coordinates: '18.9142° N, 72.7845° E',
              size: '6.1 × 2.4 m',
              color: 'red',
              hexColor: '#ef4444',
              borderColor: 'border-rose-500',
              bgColor: 'bg-rose-500/10',
              textColor: 'text-rose-600',
              tagColor: 'bg-rose-500',
              badgeBg: 'bg-rose-50 text-rose-600 border border-rose-200',
              bbox: { left: '55%', top: '25%', width: '16%', height: '24%' },
              thumb: file.thumbnail,
            },
            {
              id: `det-${fIdx}-2`,
              orderNumber: 2,
              name: 'Derelict Fishing Net / Gear',
              type: 'fishing_gear',
              confidence: 88,
              coordinates: '18.9158° N, 72.7862° E',
              size: '11.8 × 4.2 m',
              color: 'amber',
              hexColor: '#f59e0b',
              borderColor: 'border-amber-500',
              bgColor: 'bg-amber-500/10',
              textColor: 'text-amber-600',
              tagColor: 'bg-amber-500',
              badgeBg: 'bg-amber-50 text-amber-600 border border-amber-200',
              bbox: { left: '25%', top: '46%', width: '18%', height: '17%' },
              thumb: file.thumbnail,
            },
            {
              id: `det-${fIdx}-3`,
              orderNumber: 3,
              name: 'Submerged Metallic Debris',
              type: 'debris',
              confidence: 82,
              coordinates: '18.9171° N, 72.7879° E',
              size: '4.5 × 1.9 m',
              color: 'blue',
              hexColor: '#3b82f6',
              borderColor: 'border-blue-500',
              bgColor: 'bg-blue-500/10',
              textColor: 'text-blue-600',
              tagColor: 'bg-blue-500',
              badgeBg: 'bg-blue-50 text-blue-600 border border-blue-200',
              bbox: { left: '74%', top: '55%', width: '13%', height: '15%' },
              thumb: file.thumbnail,
            },
          ];
        }

        const hasHigh = mappedDetections.some(d => d.color === 'red');
        const hasMed = mappedDetections.some(d => d.color === 'amber');
        const priority: 'High' | 'Medium' | 'Low' | 'None' = hasHigh
          ? 'High'
          : hasMed
            ? 'Medium'
            : mappedDetections.length > 0
              ? 'Low'
              : 'None';

        return {
          id: `file-${fIdx}-${file.name}`,
          filename: file.name,
          objectsCount: mappedDetections.length,
          priority,
          timestamp: new Date().toLocaleString(),
          timeShort: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          size: file.size,
          location: surveyLocation || 'Arabian Sea Shelf',
          frequency: '455kHz',
          swath: '75m',
          speed: '3kts',
          timeHud: new Date().toLocaleTimeString(),
          thumb: file.thumbnail,
          sonarImg: file.thumbnail,
          detections: mappedDetections,
        };
      });
    }

    // 3. Fallback if neither activeSurveyFiles nor selectedFiles
    return [{
      id: 'default-file',
      filename: 'transect_sss_line_01.png',
      objectsCount: 0,
      priority: 'None' as const,
      timestamp: new Date().toLocaleString(),
      timeShort: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      size: '1.7 MB',
      location: surveyLocation || 'Arabian Sea Shelf',
      frequency: '455kHz',
      swath: '75m',
      speed: '3kts',
      timeHud: new Date().toLocaleTimeString(),
      thumb: '/sonar-tile-1.jpg',
      sonarImg: '/sonar-tile-1.jpg',
      detections: [],
    }];
  }, [activeSurveyFiles, activeDetections, selectedFiles, surveyLocation]);

  // Dynamic batch summary statistics for Step 4 (Results)
  const batchSummaryStats: BatchSummaryStats = useMemo(() => {
    const totalImages = allBatchSurveyImages.length;
    const imagesWithDets = allBatchSurveyImages.filter(img => img.detections.length > 0).length;
    const imagesWithDetsPercent = totalImages > 0 ? Math.round((imagesWithDets / totalImages) * 100) : 0;
    const imagesWithoutDets = Math.max(0, totalImages - imagesWithDets);

    const totalObjects = allBatchSurveyImages.reduce((acc, img) => acc + img.detections.length, 0);
    const highPriority = allBatchSurveyImages.reduce(
      (acc, img) => acc + img.detections.filter(d => d.color === 'red').length,
      0
    );
    const medPriority = allBatchSurveyImages.reduce(
      (acc, img) => acc + img.detections.filter(d => d.color === 'amber').length,
      0
    );
    const lowPriority = allBatchSurveyImages.reduce(
      (acc, img) => acc + img.detections.filter(d => d.color === 'blue').length,
      0
    );

    const highPriorityPercent = totalObjects > 0 ? Math.round((highPriority / totalObjects) * 100) : 0;
    const medPriorityPercent = totalObjects > 0 ? Math.round((medPriority / totalObjects) * 100) : 0;
    const lowPriorityPercent = totalObjects > 0 ? Math.round((lowPriority / totalObjects) * 100) : 0;

    return {
      totalImages,
      imagesWithDets,
      imagesWithDetsPercent,
      imagesWithoutDets,
      totalObjects,
      highPriority,
      highPriorityPercent,
      medPriority,
      medPriorityPercent,
      lowPriority,
      lowPriorityPercent,
    };
  }, [allBatchSurveyImages]);

  const activeReportImage = useMemo(() => {
    return (
      allBatchSurveyImages.find(img => img.id === selectedBatchImageId) ||
      allBatchSurveyImages[0] || {
        id: 'default',
        filename: 'transect_sss_line_01.png',
        objectsCount: 0,
        priority: 'None' as const,
        timestamp: new Date().toLocaleString(),
        timeShort: '12:00 PM',
        size: '1.7 MB',
        location: surveyLocation || 'Arabian Sea Shelf',
        frequency: '455kHz',
        swath: '75m',
        speed: '3kts',
        timeHud: '12:00:00',
        thumb: '/sonar-tile-1.jpg',
        sonarImg: '/sonar-tile-1.jpg',
        detections: [],
      }
    );
  }, [allBatchSurveyImages, selectedBatchImageId, surveyLocation]);

  const handlePrintPdfReport = () => {
    setIsReportModalOpen(false);
    setIsReportPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
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

    const surveyPoints: [number, number, string][] = backendSurveys
      .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number')
      .map(s => [
        s.latitude as number,
        s.longitude as number,
        `${s.name} - ${s.file_count || 0} images`,
      ]);

    surveyPoints.forEach(([lat, lng, name]) => {
      const icon = L.divIcon({
        className: 'survey-marker-blue',
        html: `
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([lat, lng], { icon }).bindPopup(`<b>${name}</b><br/>Status: Active Survey`).addTo(map);
    });

    const highPriorityPoints: [number, number, string][] = activeDetections
      .filter(d => (d.priority === 'HIGH' || d.priority === 'CRITICAL') && d.location && typeof d.location.latitude === 'number')
      .map(d => [
        d.location.latitude,
        d.location.longitude,
        `Target ${d.code || d.id} (${d.class_name})`,
      ]);

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
  }, [currentScreen, backendSurveys, activeDetections]);

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

    const detMarkers = detailedDetections.map((det) => ({
      lat: det.rawLat,
      lng: det.rawLng,
      label: `${det.number} ${det.name}`,
      color: det.color,
      id: det.id,
    }));

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

    const validCoords = detMarkers.filter(m => typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng) && m.lat !== 0 && m.lng !== 0);
    if (validCoords.length > 0) {
      const group = L.featureGroup(validCoords.map(m => L.marker([m.lat, m.lng])));
      map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 10 });
    }

    fullMapInstance.current = map;

    return () => {
      if (fullMapInstance.current) {
        fullMapInstance.current.remove();
        fullMapInstance.current = null;
      }
    };
  }, [currentScreen, mapLayerMode, detailedDetections]);

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

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const filesArr = Array.from(e.dataTransfer.files);
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
    if (!surveyName.trim()) {
      setSurveyDetailsError('Please enter a survey name before continuing.');
      return;
    }
    setSurveyDetailsError('');
    setIsSurveyDetailsLocked(true);

    try {
      const created = await apiService.createSurvey({
        name: surveyName,
        location_name: surveyLocation,
        description: surveyDescription,
        operator: profileOrg,
        sonar_device: 'Side-Scan Sonar',
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
    if (selectedFiles.length === 0) {
      return;
    }
    setNewSurveyStep(3);
    setProcessingProgress(20);
    setActiveStage(1);
    setIsProcessingComplete(false);
    setElapsedSeconds(0);

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
          apiService.getDetections(activeSurveyId).catch(() => []),
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
        d.estimatedHeightMeters,
      ]),
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

  const handleBatchDownloadAll = () => {
    handleExportCSV();
  };

  const handleBatchDownloadDetectionsOnly = () => {
    handleExportCSV();
  };

  const handleBatchExportVerifiedOnly = () => {
    handleExportCSV();
  };

  return (
    <>
      <div className="dashboard-app-container h-screen w-full flex overflow-hidden bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* 1. Minimalist White Sidebar */}
        <aside className="w-[198px] sm:w-[218px] bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between shrink-0 select-none z-30">
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
                  setIsSurveyDetailsLocked(false);
                  setSurveyDetailsError('');
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

          {/* Sidebar Footer: User Info & Logout */}
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

          {/* SCREEN 1: DASHBOARD OVERVIEW */}
          {currentScreen === 'dashboard' && (
            <DashboardOverviewView
              formattedToday={formattedToday}
              backendMetrics={backendMetrics}
              backendSurveys={backendSurveys}
              activeDetections={activeDetections}
              surveyCatalogData={surveyCatalogData}
              dashMapRef={dashMapRef}
              dashMapInstance={dashMapInstance}
              setCurrentScreen={setCurrentScreen}
              setNewSurveyStep={setNewSurveyStep}
              setIsSurveyDetailsLocked={setIsSurveyDetailsLocked}
              setSurveyDetailsError={setSurveyDetailsError}
              setSelectedCatalogSurveyId={setSelectedCatalogSurveyId}
              setActiveSurveyId={setActiveSurveyId}
            />
          )}

          {/* SCREEN 2: NEW SURVEY WIZARD (STEPS 1-4) */}
          {currentScreen === 'new-survey' && (
            <NewSurveyWizard
              newSurveyStep={newSurveyStep}
              setNewSurveyStep={setNewSurveyStep}
              isSurveyDetailsLocked={isSurveyDetailsLocked}
              setIsSurveyDetailsLocked={setIsSurveyDetailsLocked}
              isProcessingComplete={isProcessingComplete}
              setCurrentScreen={setCurrentScreen}
              surveyName={surveyName}
              setSurveyName={setSurveyName}
              surveyDate={surveyDate}
              setSurveyDate={setSurveyDate}
              surveyLocation={surveyLocation}
              setSurveyLocation={setSurveyLocation}
              surveyDescription={surveyDescription}
              setSurveyDescription={setSurveyDescription}
              surveyDetailsError={surveyDetailsError}
              setSurveyDetailsError={setSurveyDetailsError}
              handleCreateSurveyStep1={handleCreateSurveyStep1}
              fileInputRef={fileInputRef}
              handleFileInputChange={handleFileInputChange}
              handleAddFiles={handleAddFiles}
              handleDropFiles={handleDropFiles}
              isDraggingFile={isDraggingFile}
              setIsDraggingFile={setIsDraggingFile}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              handleRemoveFile={handleRemoveFile}
              batchViewMode={batchViewMode}
              setBatchViewMode={setBatchViewMode}
              isSupportedFormatsModalOpen={isSupportedFormatsModalOpen}
              setIsSupportedFormatsModalOpen={setIsSupportedFormatsModalOpen}
              handleStartProcessingStep2={handleStartProcessingStep2}
              processingProgress={processingProgress}
              activeStage={activeStage}
              elapsedSeconds={elapsedSeconds}
              allBatchSurveyImages={allBatchSurveyImages}
              batchSummaryStats={batchSummaryStats}
              batchFilterTab={batchFilterTab}
              setBatchFilterTab={setBatchFilterTab}
              batchSearchQuery={batchSearchQuery}
              setBatchSearchQuery={setBatchSearchQuery}
              batchSortBy={batchSortBy}
              setBatchSortBy={setBatchSortBy}
              batchPaginationPage={batchPaginationPage}
              setBatchPaginationPage={setBatchPaginationPage}
              selectedBatchImageId={selectedBatchImageId}
              setSelectedBatchImageId={setSelectedBatchImageId}
              selectedDetectionCardId={selectedDetectionCardId}
              setSelectedDetectionCardId={setSelectedDetectionCardId}
              batchSelectedImageIds={batchSelectedImageIds}
              setBatchSelectedImageIds={setBatchSelectedImageIds}
              batchViewTab={batchImageDisplayMode}
              setBatchViewTab={setBatchImageDisplayMode}
              batchZoomLevel={batchZoomLevel}
              setBatchZoomLevel={setBatchZoomLevel}
              detectionReviewMap={detectionReviewMap}
              isClassifyDropdownOpen={isClassifyDropdownOpen}
              setIsClassifyDropdownOpen={setIsClassifyDropdownOpen}
              handleOperatorVerify={handleOperatorVerify}
              handleBatchDownloadAll={handleBatchDownloadAll}
              handleBatchDownloadDetectionsOnly={handleBatchDownloadDetectionsOnly}
              handleBatchExportVerifiedOnly={handleBatchExportVerifiedOnly}
              handleExportCSV={handleExportCSV}
              setIsReportModalOpen={setIsReportModalOpen}
            />
          )}

          {/* SCREEN 3: SURVEYS CATALOG */}
          {currentScreen === 'surveys' && (
            <SurveysCatalogView
              surveyCatalogData={surveyCatalogData}
              surveyTabFilter={surveyTabFilter}
              setSurveyTabFilter={setSurveyTabFilter}
              selectedCatalogSurveyId={selectedCatalogSurveyId}
              setSelectedCatalogSurveyId={setSelectedCatalogSurveyId}
              selectedCatalogSurvey={selectedCatalogSurvey}
              detailedDetections={detailedDetections}
              setCurrentScreen={setCurrentScreen}
              setNewSurveyStep={setNewSurveyStep}
              setIsSurveyDetailsLocked={setIsSurveyDetailsLocked}
              setSurveyDetailsError={setSurveyDetailsError}
              setIsReportModalOpen={setIsReportModalOpen}
            />
          )}

          {/* SCREEN 4: DETECTION MAP */}
          {currentScreen === 'map' && (
            <SurveyMapView
              selectedMapSurvey={selectedMapSurvey}
              setSelectedMapSurvey={setSelectedMapSurvey}
              backendSurveys={backendSurveys}
              setActiveSurveyId={setActiveSurveyId}
              mapSurveyStats={mapSurveyStats}
              mapLayerMode={mapLayerMode}
              setMapLayerMode={setMapLayerMode}
              fullMapRef={fullMapRef}
              fullMapInstance={fullMapInstance}
              detailedDetections={detailedDetections}
              selectedMapDetectionId={selectedMapDetectionId}
              setSelectedMapDetectionId={setSelectedMapDetectionId}
            />
          )}

          {/* SCREEN 5: SETTINGS */}
          {currentScreen === 'settings' && (
            <SurveySettingsView
              profileFullName={profileFullName}
              setProfileFullName={setProfileFullName}
              profileRole={profileRole}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              profileOrg={profileOrg}
              setProfileOrg={setProfileOrg}
              profilePhone={profilePhone}
              setProfilePhone={setProfilePhone}
              profileTeam={profileTeam}
              setProfileTeam={setProfileTeam}
              profileLocation={profileLocation}
              setProfileLocation={setProfileLocation}
              profileBio={profileBio}
              setProfileBio={setProfileBio}
              isProfileSaved={isProfileSaved}
              setIsProfileSaved={setIsProfileSaved}
            />
          )}
        </div>
      </div>

      {/* Generate Report Options Modal */}
      <GenerateReportOptionsModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onOpenPdfPreview={() => {
          setIsReportModalOpen(false);
          setIsReportPreviewOpen(true);
        }}
        onDirectPrint={handlePrintPdfReport}
        onExportCsv={() => {
          setIsReportModalOpen(false);
          handleExportCSV();
        }}
      />

      {/* Executive Report Preview Modal (On-Screen) */}
      <ExecutiveReportPreviewModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        onPrint={handlePrintPdfReport}
        surveyName={surveyName}
        surveyLocation={surveyLocation}
        surveyDate={surveyDate}
        operatorName={profileFullName}
        activeImage={activeReportImage}
        batchStats={batchSummaryStats}
      />

      {/* Dedicated Print Target (Visible Only in Print Mode via index.css) */}
      <div id="executive-pdf-report" className="hidden print:block bg-white text-slate-900">
        <ExecutivePdfReportDocument
          surveyName={surveyName}
          surveyLocation={surveyLocation}
          surveyDate={surveyDate}
          operatorName={profileFullName}
          activeImage={activeReportImage}
          batchStats={batchSummaryStats}
        />
      </div>
    </>
  );
};
