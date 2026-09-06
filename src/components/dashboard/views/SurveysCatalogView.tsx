import React from 'react';
import {
  Plus,
  Calendar,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Crosshair,
  CheckCircle2,
  HelpCircle,
  FileText,
  Map as MapIcon,
} from 'lucide-react';
import type { DashboardScreen, SurveyCatalogItem, MapDetection } from '../types/dashboard.types';

interface SurveysCatalogViewProps {
  surveyCatalogData: SurveyCatalogItem[];
  surveyTabFilter: 'all' | 'completed' | 'processing' | 'high_priority' | 'archived';
  setSurveyTabFilter: (tab: 'all' | 'completed' | 'processing' | 'high_priority' | 'archived') => void;
  selectedCatalogSurveyId: string;
  setSelectedCatalogSurveyId: (id: string) => void;
  selectedCatalogSurvey: SurveyCatalogItem;
  detailedDetections: MapDetection[];
  setCurrentScreen: (screen: DashboardScreen) => void;
  setNewSurveyStep: (step: 1 | 2 | 3 | 4) => void;
  setIsSurveyDetailsLocked: (locked: boolean) => void;
  setSurveyDetailsError: (err: string) => void;
  setIsReportModalOpen: (open: boolean) => void;
}

export const SurveysCatalogView: React.FC<SurveysCatalogViewProps> = ({
  surveyCatalogData,
  surveyTabFilter,
  setSurveyTabFilter,
  selectedCatalogSurveyId,
  setSelectedCatalogSurveyId,
  selectedCatalogSurvey,
  detailedDetections,
  setCurrentScreen,
  setNewSurveyStep,
  setIsSurveyDetailsLocked,
  setSurveyDetailsError,
  setIsReportModalOpen,
}) => {
  return (
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
            setIsSurveyDetailsLocked(false);
            setSurveyDetailsError('');
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
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
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
  );
};
