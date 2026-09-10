import React from 'react';
import {
  MapPin,
  ChevronDown,
  Image as ImageIcon,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Locate,
  Filter,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import type L from 'leaflet';
import type { MapDetection } from '../types/dashboard.types';
import type { ApiSurvey } from '../../../services/api';

interface SurveyMapViewProps {
  selectedMapSurvey: string;
  setSelectedMapSurvey: (val: string) => void;
  backendSurveys: ApiSurvey[];
  setActiveSurveyId: (id: string) => void;
  mapSurveyStats: {
    imagesProcessed: number;
    totalDetections: number;
    highPriority: number;
    verified: number;
  };
  mapLayerMode: 'map' | 'satellite';
  setMapLayerMode: (mode: 'map' | 'satellite') => void;
  fullMapRef: React.RefObject<HTMLDivElement | null>;
  fullMapInstance: React.MutableRefObject<L.Map | null>;
  detailedDetections: MapDetection[];
  selectedMapDetectionId: string;
  setSelectedMapDetectionId: (id: string) => void;
}

export const SurveyMapView: React.FC<SurveyMapViewProps> = ({
  selectedMapSurvey,
  setSelectedMapSurvey,
  backendSurveys,
  setActiveSurveyId,
  mapSurveyStats,
  mapLayerMode,
  setMapLayerMode,
  fullMapRef,
  fullMapInstance,
  detailedDetections,
  selectedMapDetectionId,
  setSelectedMapDetectionId,
}) => {
  return (
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
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMapSurvey(val);
              const found = backendSurveys.find(s => s.name === val);
              if (found) {
                setActiveSurveyId(found.id);
              }
            }}
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

      {/* Survey Statistics */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
          Survey Statistics
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                {mapSurveyStats.imagesProcessed}
              </div>
              <div className="text-[10px] text-slate-500">Images Processed</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Crosshair className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                {mapSurveyStats.totalDetections}
              </div>
              <div className="text-[10px] text-slate-500">Total Detections</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                {mapSurveyStats.highPriority}
              </div>
              <div className="text-[10px] text-slate-500">High Priority</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                {mapSurveyStats.verified}
              </div>
              <div className="text-[10px] text-slate-500">Verified</div>
            </div>
          </div>
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

          {detailedDetections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Crosshair className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Detections Found</p>
              <p className="text-[10px] text-slate-400 max-w-[190px] mt-0.5">
                No geolocated detections recorded for this survey yet.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </main>
  );
};
