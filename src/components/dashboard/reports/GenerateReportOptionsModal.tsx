import React from 'react';
import { Printer, FileText, ArrowRight, FileSpreadsheet, X } from 'lucide-react';

interface GenerateReportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfPreview: () => void;
  onDirectPrint: () => void;
  onExportCsv: () => void;
}

export const GenerateReportOptionsModal: React.FC<GenerateReportOptionsModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfPreview,
  onDirectPrint,
  onExportCsv,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Generate Survey Report
            </h3>
          </div>
          <button
            onClick={onClose}
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
              onClose();
              onOpenPdfPreview();
            }}
            className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400 text-xs font-bold text-slate-900 flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <span className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-left">
                <div className="font-bold text-blue-950">Executive PDF Summary</div>
                <div className="text-[10px] text-blue-700/80 font-normal">Official Naval Hydrographic Report (A4 Format)</div>
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
          </button>

          <button
            onClick={() => {
              onDirectPrint();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center space-x-2.5">
              <Printer className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="text-left">
                <div className="font-bold">Quick Print / Direct PDF</div>
                <div className="text-[10px] text-slate-500 font-normal">Send directly to browser PDF printer</div>
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              onExportCsv();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center space-x-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-left">
                <div className="font-bold">Raw Detections CSV Table</div>
                <div className="text-[10px] text-slate-500 font-normal">Spreadsheet with coordinates & shadow geometry</div>
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
