import React from 'react';
import {
  Info,
  UploadCloud,
  Image as ImageIcon,
  X,
  Grid,
  List,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { UploadedFileItem } from '../types/dashboard.types';

interface Step2UploadSonarProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddFiles: () => void;
  handleDropFiles: (e: React.DragEvent) => void;
  isDraggingFile: boolean;
  setIsDraggingFile: (dragging: boolean) => void;
  selectedFiles: UploadedFileItem[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<UploadedFileItem[]>>;
  handleRemoveFile: (idx: number) => void;
  batchViewMode: 'grid' | 'list';
  setBatchViewMode: (mode: 'grid' | 'list') => void;
  setIsSupportedFormatsModalOpen: (open: boolean) => void;
  onBack: () => void;
  onStartProcessing: () => void;
}

export const Step2UploadSonar: React.FC<Step2UploadSonarProps> = ({
  fileInputRef,
  handleFileInputChange,
  handleAddFiles,
  handleDropFiles,
  isDraggingFile,
  setIsDraggingFile,
  selectedFiles,
  setSelectedFiles,
  handleRemoveFile,
  batchViewMode,
  setBatchViewMode,
  setIsSupportedFormatsModalOpen,
  onBack,
  onStartProcessing,
}) => {
  return (
    <div className="space-y-3">
      {/* Hidden File Input for Real File Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".png,.jpg,.jpeg,.tif,.tiff,.bmp"
        className="hidden"
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column (5 cols): Upload Box & Selected Files */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                Upload Side-Scan Sonar Data
              </h2>
              <p className="text-[11px] text-slate-500">
                Select one or multiple sonar image files for analysis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportedFormatsModalOpen(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors cursor-pointer"
            >
              <Info className="w-2.5 h-2.5 text-blue-600" />
              <span>Formats</span>
            </button>
          </div>

          {/* Dropzone */}
          <div
            onClick={handleAddFiles}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
            }}
            onDrop={handleDropFiles}
            className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer space-y-1 ${isDraggingFile
              ? 'border-blue-500 bg-blue-100/50 scale-[1.01]'
              : 'border-blue-200 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/40'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              Drag &amp; drop sonar images here
            </div>
            <div className="text-[10px] text-slate-400">or</div>
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
            >
              Browse Files
            </button>
            <p className="text-[9.5px] font-mono text-slate-400 pt-0.5">
              PNG, JPEG, TIFF, BMP • Up to 25 MB per file
            </p>
            <div className="pt-0.5">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const sampleItem: UploadedFileItem = {
                    name: 'transect_sss_line_01.png',
                    size: '1.7 MB',
                    thumbnail: '/sonar-tile-1.jpg',
                  };
                  setSelectedFiles(prev => [...prev, sampleItem]);
                }}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
              >
                + Load sample sonar image
              </span>
            </div>
          </div>

          {/* Selected Files List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                Selected Files ({selectedFiles.length})
              </span>
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate font-mono text-[11px]">
                        {file.name}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-mono">
                        {file.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Batch Preview */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                  Batch Preview
                </h2>
                <p className="text-[11px] text-slate-500">
                  {selectedFiles.length} images selected
                </p>
              </div>

              {/* View Mode Toggle: Grid View vs List View */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setBatchViewMode('grid')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[11px] ${batchViewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setBatchViewMode('list')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[11px] ${batchViewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <List className="w-3 h-3" />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* Previews: 3x2 Grid */}
            {batchViewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 group"
                  >
                    <div className="h-20 sm:h-22 w-full overflow-hidden relative">
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/60 text-white font-mono text-[8.5px]">
                        {file.size}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white border-t border-slate-100">
                      <div className="text-[10px] font-mono font-bold text-slate-800 truncate">
                        {file.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-900">
                          {file.name}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono">
                          {file.size} • Ready
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tips for best results */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 flex items-start space-x-2.5 mt-1">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-bold text-blue-900">Tips for best results</h5>
                <ul className="text-[10px] text-blue-800/80 space-y-0.5 list-disc pl-3.5">
                  <li>Use high-resolution side-scan sonar images (port-starboard oriented).</li>
                  <li>Supported: PNG, JPEG, TIFF, BMP • Up to 25 MB per file.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <button
              onClick={onBack}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Back
            </button>

            <div className="flex items-center space-x-2.5">
              {selectedFiles.length === 0 && (
                <span className="text-[10.5px] font-mono text-amber-600 font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Select at least 1 image</span>
                </span>
              )}
              <button
                disabled={selectedFiles.length === 0}
                onClick={onStartProcessing}
                className={`px-5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center space-x-1.5 ${selectedFiles.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
              >
                <span>Start Processing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
