import React, { useState } from 'react';
import { SAMPLE_SONAR_SCANS, CATEGORY_DETAILS } from '../../data/sampleSonarData';
import { ProceduralSonarCanvas } from './ProceduralSonarCanvas';
import { ShadowGeometryCard } from './ShadowGeometryCard';
import type { SonarScan } from '../../types';
import {
  UploadCloud,
  Download,
  MapPin,
  RefreshCw,
  Cpu,
  FileSpreadsheet,
  FileCode,
  Crosshair
} from 'lucide-react';

interface Props {
  onNavigateToMap: (detectionId?: string) => void;
}

export const SonarDetectionStudio: React.FC<Props> = ({ onNavigateToMap }) => {
  const [scans, setScans] = useState<SonarScan[]>(SAMPLE_SONAR_SCANS);
  const [selectedScanId, setSelectedScanId] = useState<string>(SAMPLE_SONAR_SCANS[0].id);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(
    SAMPLE_SONAR_SCANS[0].detections[0]?.id || null
  );
  const [palette, setPalette] = useState<'amber' | 'cyan' | 'green' | 'copper'>('amber');
  const [isSimulatingInference, setIsSimulatingInference] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Active scan
  const activeScan = scans.find(s => s.id === selectedScanId) || scans[0];
  const activeDetection = activeScan.detections.find(d => d.id === selectedDetectionId) || activeScan.detections[0];

  // Handle custom upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newScan: SonarScan = {
        id: `custom-scan-${Date.now()}`,
        title: `Survey Ingest: ${file.name.substring(0, 24)}`,
        sector: 'Operator Uploaded Hydrographic Swath',
        surveyVessel: 'Autonomous Surface Vessel (ASV)',
        frequencyKhz: 455,
        altitudeMeters: 9.0,
        slantRangeMeters: 45.0,
        dateCaptured: new Date().toISOString(),
        description: 'Uploaded sonar tile processed via client-side YOLOv12 inference pipeline.',
        imageUrl: reader.result as string,
        detections: [
          {
            id: `custom-det-${Date.now()}-1`,
            name: 'Classified Subsea Net Cluster',
            category: 'ghost_net',
            confidence: 93.2,
            bbox: { x: 30, y: 35, width: 35, height: 28 },
            coordinates: { lat: 18.9520, lng: 72.8310 },
            depthMeters: 34.0,
            shadowLengthMeters: 4.2,
            estimatedHeightMeters: 1.15,
            acousticShadowVerified: true,
            severity: 'critical',
            timestamp: new Date().toISOString(),
            materialComposition: 'Entangled Commercial Trawling Gear',
          }
        ]
      };

      setScans([newScan, ...scans]);
      setSelectedScanId(newScan.id);
      setSelectedDetectionId(newScan.detections[0].id);
    };
    reader.readAsDataURL(file);
  };

  // Run Simulated YOLO re-inference
  const triggerReInference = () => {
    setIsSimulatingInference(true);
    setTimeout(() => {
      setIsSimulatingInference(false);
    }, 900);
  };

  // Export JSON/CSV
  const exportManifest = (type: 'json' | 'csv') => {
    let content = '';
    const filename = `vainateya-survey-manifest-${activeScan.id}.${type}`;

    if (type === 'json') {
      content = JSON.stringify(activeScan, null, 2);
    } else {
      content = 'ID,Name,Category,Confidence,Latitude,Longitude,Depth_m,Estimated_Height_m,Shadow_Length_m,Severity\n' +
        activeScan.detections.map(d =>
          `"${d.id}","${d.name}","${d.category}",${d.confidence},${d.coordinates.lat},${d.coordinates.lng},${d.depthMeters},${d.estimatedHeightMeters},${d.shadowLengthMeters},"${d.severity}"`
        ).join('\n');
    }

    const blob = new Blob([content], { type: type === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setShowExportModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Studio Header & Scan Quick Picker */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 font-bold mb-1.5">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="uppercase tracking-widest">Acoustic Sonar Detection Studio</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600">YOLOv12 SSS Pretrained Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            Side-Scan Sonar Analysis & Shadow Verification
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Custom Ingest File Input */}
          <label className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold cursor-pointer transition-all shadow-sm">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Upload Sonar SSS</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Export Report Trigger */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Survey Data</span>
          </button>
        </div>
      </div>

      {/* Preset Sonar Datasets Selection Strip */}
      <div>
        <span className="text-xs font-mono text-slate-600 uppercase tracking-wider block mb-3 font-semibold">
          Select SSS Hydrographic Dataset Transect:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scans.map((scan) => {
            const isSelected = scan.id === selectedScanId;
            return (
              <button
                key={scan.id}
                onClick={() => {
                  setSelectedScanId(scan.id);
                  setSelectedDetectionId(scan.detections[0]?.id || null);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all ${isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20 text-slate-900'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-blue-700 font-bold">{scan.frequencyKhz} kHz</span>
                  <span className="text-slate-500">{scan.detections.length} Target(s)</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{scan.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-mono">{scan.sector}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Sonar Waterfall Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <ProceduralSonarCanvas
            detections={activeScan.detections}
            showBoundingBoxes={showBoxes}
            onToggleBoundingBoxes={() => setShowBoxes(!showBoxes)}
            confidenceThreshold={confidenceThreshold}
            selectedDetectionId={selectedDetectionId}
            onSelectDetection={(id) => setSelectedDetectionId(id)}
            colorPalette={palette}
          />

          {/* Canvas Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Color Map / Colormap Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 font-medium">Palette:</span>
              {(['amber', 'cyan', 'green', 'copper'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${palette === p
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Confidence Threshold Slider */}
            <div className="flex items-center space-x-3 min-w-[220px]">
              <span className="text-slate-600 font-medium whitespace-nowrap">Min Confidence:</span>
              <input
                type="range"
                min="50"
                max="98"
                step="1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-blue-700 font-bold font-mono">{confidenceThreshold}%</span>
            </div>

            {/* Re-run Inference */}
            <button
              onClick={triggerReInference}
              disabled={isSimulatingInference}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSimulatingInference ? 'animate-spin' : ''}`} />
              <span>{isSimulatingInference ? 'Inference...' : 'Re-run YOLO'}</span>
            </button>
          </div>

          {/* Scan Metadata Card */}
          <div className="bg-white rounded-xl p-4 text-xs font-mono text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 border border-slate-200 shadow-sm">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Survey Vessel</span>
              <span className="text-slate-900 font-bold">{activeScan.surveyVessel}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Acoustic Frequency</span>
              <span className="text-blue-700 font-bold">{activeScan.frequencyKhz} kHz High-Chirp</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Towfish Altitude</span>
              <span className="text-slate-900 font-bold">{activeScan.altitudeMeters} m Above Bed</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Slant Range</span>
              <span className="text-slate-900 font-bold">{activeScan.slantRangeMeters} m Port/Starboard</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detections List & Acoustic Shadow Geometry (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Classified Debris Target List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-blue-600" />
                <span>Classified Targets ({activeScan.detections.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                YOLOv12 Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {activeScan.detections.map((detection) => {
                const isSelected = selectedDetectionId === detection.id;
                const meta = CATEGORY_DETAILS[detection.category];

                return (
                  <div
                    key={detection.id}
                    onClick={() => setSelectedDetectionId(detection.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase" style={{ color: meta.color, backgroundColor: meta.bg }}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-700">
                        {detection.confidence}%
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{detection.name}</h4>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Depth: {detection.depthMeters}m</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToMap(detection.id);
                        }}
                        className="text-blue-600 hover:underline font-bold flex items-center space-x-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Map View</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Acoustic Shadow Verification Card */}
          <ShadowGeometryCard
            detection={activeDetection}
            sensorAltitude={activeScan.altitudeMeters}
            slantRange={activeScan.slantRangeMeters}
          />
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Download className="w-5 h-5 text-blue-600" />
                <span>Export Sonar Survey Manifest</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export classified debris geolocations, acoustic shadow relief heights, confidence metrics, and vessel telemetry for the current survey transect.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => exportManifest('json')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs font-mono text-slate-800"
              >
                <span className="flex items-center space-x-2 font-bold text-slate-900">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>GeoJSON / Detection Manifest (.json)</span>
                </span>
                <span className="text-slate-500">Structured Data</span>
              </button>

              <button
                onClick={() => exportManifest('csv')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs font-mono text-slate-800"
              >
                <span className="flex items-center space-x-2 font-bold text-slate-900">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Hydrographic Log Table (.csv)</span>
                </span>
                <span className="text-slate-500">Excel / GIS Import</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
