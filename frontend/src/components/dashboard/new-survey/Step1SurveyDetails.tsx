import React from 'react';
import {
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react';

interface Step1SurveyDetailsProps {
  surveyName: string;
  setSurveyName: (val: string) => void;
  surveyDate: string;
  setSurveyDate: (val: string) => void;
  surveyLocation: string;
  setSurveyLocation: (val: string) => void;
  surveyDescription: string;
  setSurveyDescription: (val: string) => void;
  surveyDetailsError: string;
  setSurveyDetailsError: (err: string) => void;
  onCancel: () => void;
  onNext: () => void;
}

export const Step1SurveyDetails: React.FC<Step1SurveyDetailsProps> = ({
  surveyName,
  setSurveyName,
  surveyDate,
  setSurveyDate,
  surveyLocation,
  setSurveyLocation,
  surveyDescription,
  setSurveyDescription,
  surveyDetailsError,
  setSurveyDetailsError,
  onCancel,
  onNext,
}) => {
  return (
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
              onChange={e => {
                setSurveyName(e.target.value);
                if (surveyDetailsError && e.target.value.trim()) {
                  setSurveyDetailsError('');
                }
              }}
              placeholder="e.g. Arabian Sea Survey - Sept 2026"
              className={`w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${surveyDetailsError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
            />
            {surveyDetailsError && (
              <p className="text-[11px] text-rose-600 font-bold flex items-center space-x-1 mt-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{surveyDetailsError}</span>
              </p>
            )}
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
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Next: Upload Data</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
