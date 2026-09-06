import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { ExecutivePdfReportDocument } from './ExecutivePdfReportDocument';
import type { BatchImageResult, BatchSummaryStats } from '../types/dashboard.types';

interface ExecutiveReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  surveyName: string;
  surveyLocation: string;
  surveyDate: string;
  operatorName: string;
  activeImage: BatchImageResult;
  batchStats: BatchSummaryStats;
}

export const ExecutiveReportPreviewModal: React.FC<ExecutiveReportPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  surveyName,
  surveyLocation,
  surveyDate,
  operatorName,
  activeImage,
  batchStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center">
      {/* Top Sticky Control Bar */}
      <div className="sticky top-0 z-10 w-full max-w-[860px] bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl border border-slate-800 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-['Space_Grotesk'] text-white">
              Executive Marine Survey Report Preview
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Official Hydrographic Format • Certified A4 Print Standard
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span>Save as PDF / Print</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Paper Document Preview */}
      <div className="w-full max-w-[860px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-12">
        <ExecutivePdfReportDocument
          surveyName={surveyName}
          surveyLocation={surveyLocation}
          surveyDate={surveyDate}
          operatorName={operatorName}
          activeImage={activeImage}
          batchStats={batchStats}
        />
      </div>
    </div>
  );
};
