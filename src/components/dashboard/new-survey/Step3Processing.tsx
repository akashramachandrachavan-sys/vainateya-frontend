import React from 'react';
import {
  CheckCircle2,
  RotateCw,
  Info,
  ArrowRight,
  FileText,
  Crosshair,
  Clock,
  Activity,
} from 'lucide-react';
import type { UploadedFileItem, BatchSummaryStats } from '../types/dashboard.types';

interface Step3ProcessingProps {
  selectedFiles: UploadedFileItem[];
  processingProgress: number;
  isProcessingComplete: boolean;
  activeStage: number;
  elapsedSeconds: number;
  batchSummaryStats: BatchSummaryStats;
  onViewResults: () => void;
}

export const Step3Processing: React.FC<Step3ProcessingProps> = ({
  selectedFiles,
  processingProgress,
  isProcessingComplete,
  activeStage,
  elapsedSeconds,
  batchSummaryStats,
  onViewResults,
}) => {
  return (
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
                {selectedFiles.length || 1} {selectedFiles.length === 1 ? 'image' : 'images'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">
                  {isProcessingComplete
                    ? `${selectedFiles.length || 1} of ${selectedFiles.length || 1} images processed`
                    : `${Math.min(selectedFiles.length || 1, Math.max(1, Math.floor((selectedFiles.length || 1) * (processingProgress / 100))))} of ${selectedFiles.length || 1} images processed`}
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

          {/* Bottom Alert and Action */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 leading-tight">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Please keep this page open. Processing runs in high-priority GPU batch mode.
              </span>
            </div>

            {isProcessingComplete ? (
              <button
                onClick={onViewResults}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
              >
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs flex items-center space-x-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Processing in progress...</span>
              </div>
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
                {isProcessingComplete ? `${selectedFiles.length || 1} / ${selectedFiles.length || 1}` : `1 / ${selectedFiles.length || 1}`}
              </span>
            </div>

            {/* Active Sonar Waterfall Box with Scanning Laser HUD */}
            <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black aspect-16/10 max-h-40">
              <img
                src={selectedFiles[0]?.thumbnail || '/sonar-tile-1.jpg'}
                alt={selectedFiles[0]?.name || 'Current active sonar frame'}
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
              <span className="font-bold text-slate-800 truncate max-w-[220px]">
                {selectedFiles[0]?.name || 'sonar_001.tif'}
              </span>
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
                  {isProcessingComplete ? `${selectedFiles.length || 1} / ${selectedFiles.length || 1}` : `1 / ${selectedFiles.length || 1}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Crosshair className="w-3 h-3 text-purple-600" />
                  <span className="text-[11px]">Potential Detections</span>
                </span>
                <span className="font-bold font-mono text-purple-600 text-xs">
                  {batchSummaryStats.totalObjects}
                </span>
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
                  ~ {(Math.max(1.8, elapsedSeconds / Math.max(1, selectedFiles.length || 1))).toFixed(1)} sec/img
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
