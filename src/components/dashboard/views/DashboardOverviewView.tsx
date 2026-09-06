import React from 'react';
import {
  FolderKanban,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Locate,
  ArrowRight,
  Plus,
} from 'lucide-react';
import type L from 'leaflet';
import type {
  DashboardScreen,
  SurveyCatalogItem,
} from '../types/dashboard.types';
import type { ApiSurvey, ApiDetection, SystemMetrics } from '../../../services/api';

interface DashboardOverviewViewProps {
  formattedToday: string;
  backendMetrics: SystemMetrics | null;
  backendSurveys: ApiSurvey[];
  activeDetections: ApiDetection[];
  surveyCatalogData: SurveyCatalogItem[];
  dashMapRef: React.RefObject<HTMLDivElement | null>;
  dashMapInstance: React.MutableRefObject<L.Map | null>;
  setCurrentScreen: (screen: DashboardScreen) => void;
  setNewSurveyStep: (step: 1 | 2 | 3 | 4) => void;
  setIsSurveyDetailsLocked: (locked: boolean) => void;
  setSurveyDetailsError: (err: string) => void;
  setSelectedCatalogSurveyId: (id: string) => void;
  setActiveSurveyId: (id: string) => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  formattedToday,
  backendMetrics,
  backendSurveys,
  activeDetections,
  surveyCatalogData,
  dashMapRef,
  dashMapInstance,
  setCurrentScreen,
  setNewSurveyStep,
  setIsSurveyDetailsLocked,
  setSurveyDetailsError,
  setSelectedCatalogSurveyId,
  setActiveSurveyId,
}) => {
  return (
    <main className="p-3.5 sm:p-4 lg:p-5 space-y-3.5 max-w-7xl mx-auto w-full">
      {/* Header Greeting & Date */}
      <div className="flex flex-col sm:row items-start sm:items-center justify-between gap-1.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            Welcome back, Akash!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor surveys, review detections, and contribute to cleaner oceans.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
          {formattedToday}
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

          {/* Map Viewport */}
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

          {surveyCatalogData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2">
                <FolderKanban className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No Surveys Yet</p>
              <p className="text-[11px] text-slate-400 max-w-[220px] mt-0.5">
                No surveys recorded yet. Start a new survey to view recent scans here.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('new-survey');
                  setNewSurveyStep(1);
                  setIsSurveyDetailsLocked(false);
                  setSurveyDetailsError('');
                }}
                className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Survey</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-0.5">
              {surveyCatalogData.slice(0, 4).map((survey) => (
                <div
                  key={survey.id}
                  onClick={() => {
                    setSelectedCatalogSurveyId(survey.id);
                    setActiveSurveyId(survey.id);
                    setCurrentScreen('new-survey');
                    setNewSurveyStep(4);
                  }}
                  className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-10 h-8 rounded-md bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center text-blue-400 font-mono text-[9px] font-bold">
                      {survey.number}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                        {survey.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {survey.date} • {survey.images} images
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${survey.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : survey.status === 'Processing'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      {survey.status}
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{survey.detections} detections</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
