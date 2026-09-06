import React from 'react';
import { Info, X } from 'lucide-react';

interface SupportedFormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportedFormatsModal: React.FC<SupportedFormatsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                Supported Sonar Image Formats
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Specifications for Side-Scan Sonar (SSS) Batch Ingestion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
            <div className="px-2 py-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold shrink-0">
              TIFF
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">GeoTIFF / TIFF (.tif, .tiff)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Industry standard for uncompressed raw acoustic waterfall swaths. Preserves 16-bit acoustic backscatter dynamics and coordinate tags.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
            <div className="px-2 py-1 rounded bg-sky-600 text-white font-mono text-[10px] font-bold shrink-0">
              PNG
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">Portable Network Graphics (.png)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Lossless compression ideal for clear sonar waterfall frames, avoiding JPEG ringing artifacts around subtle acoustic shadows.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
            <div className="px-2 py-1 rounded bg-slate-700 text-white font-mono text-[10px] font-bold shrink-0">
              JPEG
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">Joint Photographic Experts (.jpg, .jpeg)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                High compatibility, standard export from Klein, Edgetech, and StarFish sonar acquisition software.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
            <div className="px-2 py-1 rounded bg-purple-600 text-white font-mono text-[10px] font-bold shrink-0">
              BMP
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">Windows Bitmap (.bmp)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Uncompressed legacy hydrographic capture format directly compatible with bathymetric mapping stations.
              </p>
            </div>
          </div>
        </div>

        {/* Ingestion Parameters */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-1">
          <div className="font-bold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Ingestion Parameters</span>
          </div>
          <p className="text-blue-800/80 leading-relaxed">
            Maximum file size: <b>25 MB per file</b> • Maximum batch: <b>50 images per survey</b> • Native Slant Range Correction (SRC) recommended.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
