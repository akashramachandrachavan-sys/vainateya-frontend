import React from 'react';
import {
  Image as ImageIcon,
  Target,
  Crosshair,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  X,
  Tag,
  Download,
} from 'lucide-react';
import type {
  BatchImageResult,
  BatchSummaryStats,
  BatchDetectionObject,
} from '../types/dashboard.types';

interface Step4ResultsProps {
  allBatchSurveyImages: BatchImageResult[];
  batchSummaryStats: BatchSummaryStats;
  batchFilterTab: 'all' | 'detections' | 'no_detections';
  setBatchFilterTab: (tab: 'all' | 'detections' | 'no_detections') => void;
  batchSearchQuery: string;
  setBatchSearchQuery: (query: string) => void;
  batchSortBy: 'name' | 'priority' | 'objects';
  setBatchSortBy: (sort: 'name' | 'priority' | 'objects') => void;
  batchPaginationPage: number;
  setBatchPaginationPage: React.Dispatch<React.SetStateAction<number>>;
  selectedBatchImageId: string;
  setSelectedBatchImageId: (id: string) => void;
  selectedDetectionCardId: string;
  setSelectedDetectionCardId: (id: string) => void;
  batchSelectedImageIds: string[];
  setBatchSelectedImageIds: React.Dispatch<React.SetStateAction<string[]>>;
  batchViewTab: 'detected' | 'original';
  setBatchViewTab: (tab: 'detected' | 'original') => void;
  batchZoomLevel: number;
  setBatchZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  detectionReviewMap: Record<string, { status: 'confirmed' | 'rejected' | 'classified' | 'pending'; category?: string }>;
  isClassifyDropdownOpen: boolean;
  setIsClassifyDropdownOpen: (open: boolean) => void;
  handleOperatorVerify: (detectionId: string, status: 'CONFIRMED' | 'REJECTED', categoryNote?: string) => Promise<void>;
  handleBatchDownloadAll: () => void;
  handleBatchDownloadDetectionsOnly: () => void;
  handleBatchExportVerifiedOnly: () => void;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({
  allBatchSurveyImages,
  batchSummaryStats,
  batchFilterTab,
  setBatchFilterTab,
  batchSearchQuery,
  setBatchSearchQuery,
  batchSortBy,
  setBatchSortBy,
  batchPaginationPage,
  setBatchPaginationPage,
  selectedBatchImageId,
  setSelectedBatchImageId,
  selectedDetectionCardId,
  setSelectedDetectionCardId,
  batchSelectedImageIds,
  setBatchSelectedImageIds,
  batchViewTab,
  setBatchViewTab,
  batchZoomLevel,
  setBatchZoomLevel,
  detectionReviewMap,
  isClassifyDropdownOpen,
  setIsClassifyDropdownOpen,
  handleOperatorVerify,
  handleBatchDownloadAll,
  handleBatchDownloadDetectionsOnly,
  handleBatchExportVerifiedOnly,
}) => {
  // Helper calculations for Batch Results
  const filteredBatchImages = allBatchSurveyImages
    .filter(img => {
      if (batchFilterTab === 'detections') return img.objectsCount > 0;
      if (batchFilterTab === 'no_detections') return img.objectsCount === 0;
      return true;
    })
    .filter(img =>
      img.filename.toLowerCase().includes(batchSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (batchSortBy === 'priority') {
        const priorityRank = { High: 3, Medium: 2, Low: 1, None: 0 };
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      if (batchSortBy === 'objects') {
        return b.objectsCount - a.objectsCount;
      }
      return a.filename.localeCompare(b.filename);
    });

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredBatchImages.length / itemsPerPage));
  const currentPage = Math.min(batchPaginationPage, totalPages);
  const paginatedImages = filteredBatchImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentBatchImage =
    allBatchSurveyImages.find(img => img.id === selectedBatchImageId) ||
    allBatchSurveyImages[0];

  const activeDetection =
    currentBatchImage.detections.find((d: BatchDetectionObject) => d.id === selectedDetectionCardId) ||
    currentBatchImage.detections[0];

  const activeReview = activeDetection
    ? (detectionReviewMap[activeDetection.id] || { status: 'pending', category: activeDetection.type })
    : null;

  const currentIndex = filteredBatchImages.findIndex(img => img.id === currentBatchImage.id);

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      const prevImg = filteredBatchImages[currentIndex - 1];
      setSelectedBatchImageId(prevImg.id);
      if (prevImg.detections.length > 0) {
        setSelectedDetectionCardId(prevImg.detections[0].id);
      }
    }
  };

  const handleNextImage = () => {
    if (currentIndex < filteredBatchImages.length - 1) {
      const nextImg = filteredBatchImages[currentIndex + 1];
      setSelectedBatchImageId(nextImg.id);
      if (nextImg.detections.length > 0) {
        setSelectedDetectionCardId(nextImg.detections[0].id);
      }
    }
  };

  const toggleImageSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchSelectedImageIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-2.5">
      {/* 1. TOP SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Card 1: Total Images Processed */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.totalImages}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              Total Images Processed
            </p>
          </div>
        </div>

        {/* Card 2: Images with Detections */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.imagesWithDets}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              Images with Detections ({batchSummaryStats.imagesWithDetsPercent}%)
            </p>
          </div>
        </div>

        {/* Card 3: Total Objects Detected */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Crosshair className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.totalObjects}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              Total Objects Detected
            </p>
          </div>
        </div>

        {/* Card 4: High Priority Objects */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.highPriority}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              High Priority Objects
            </p>
          </div>
        </div>

        {/* Card 5: Medium Priority Objects */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.medPriority}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              Medium Priority Objects
            </p>
          </div>
        </div>

        {/* Card 6: Low Priority Objects */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center space-x-2.5 transition-all hover:shadow-xs hover:border-slate-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk'] leading-none">
              {batchSummaryStats.lowPriority}
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
              Low Priority Objects
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN STUDIO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* LEFT COLUMN: Images List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            {/* Header with Title & Options */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                Images ({allBatchSurveyImages.length})
              </h3>
              <button
                type="button"
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[10.5px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setBatchFilterTab('all');
                  setBatchPaginationPage(1);
                }}
                className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'all'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All ({batchSummaryStats.totalImages})
              </button>
              <button
                type="button"
                onClick={() => {
                  setBatchFilterTab('detections');
                  setBatchPaginationPage(1);
                }}
                className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'detections'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Detections ({batchSummaryStats.imagesWithDets})
              </button>
              <button
                type="button"
                onClick={() => {
                  setBatchFilterTab('no_detections');
                  setBatchPaginationPage(1);
                }}
                className={`flex-1 py-1 px-1 rounded-md text-center transition-all cursor-pointer ${batchFilterTab === 'no_detections'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                No Detections ({batchSummaryStats.imagesWithoutDets})
              </button>
            </div>

            {/* Search Bar & Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={batchSearchQuery}
                  onChange={e => {
                    setBatchSearchQuery(e.target.value);
                    setBatchPaginationPage(1);
                  }}
                  className="w-full pl-7 pr-2 py-1 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>

              <div className="relative">
                <select
                  value={batchSortBy}
                  onChange={e => setBatchSortBy(e.target.value as any)}
                  className="appearance-none pl-2 pr-5 py-1 rounded-lg border border-slate-200 text-[10.5px] font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="priority">Sort: Priority</option>
                  <option value="objects">Sort: Objects</option>
                  <option value="time">Sort: Name</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Image Items List */}
            <div className="space-y-1">
              {paginatedImages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No images match your filter.
                </div>
              ) : (
                paginatedImages.map(item => {
                  const isSelected = selectedBatchImageId === item.id;
                  const isChecked = batchSelectedImageIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedBatchImageId(item.id);
                        if (item.detections.length > 0) {
                          setSelectedDetectionCardId(item.detections[0].id);
                        }
                      }}
                      className={`flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer border ${isSelected
                        ? 'border-rose-400 bg-rose-50/40 shadow-2xs ring-1 ring-rose-300'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => toggleImageSelect(item.id, e as any)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="w-10 h-8 rounded overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <img
                          src={item.thumb}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11.5px] truncate ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                            {item.filename}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500">
                            {item.objectsCount > 0 ? `${item.objectsCount} objects` : '0 objects'}
                          </span>

                          {item.priority === 'High' && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100/80 text-rose-700 border border-rose-200/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>High</span>
                            </span>
                          )}
                          {item.priority === 'Medium' && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                              <span>Medium</span>
                            </span>
                          )}
                          {item.priority === 'Low' && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                              <span>Low</span>
                            </span>
                          )}
                        </div>

                        {item.timeShort && (
                          <div className="text-[9px] text-slate-400 font-mono text-right">
                            {item.timeShort}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dynamic Pagination Controls */}
          <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setBatchPaginationPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {totalPages <= 4 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setBatchPaginationPage(pageNum)}
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === pageNum
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {pageNum}
                </button>
              ))
            ) : (
              <>
                {[1, 2, 3].map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setBatchPaginationPage(pageNum)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === pageNum
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <span className="text-slate-400 px-0.5 text-xs">...</span>
                <button
                  type="button"
                  onClick={() => setBatchPaginationPage(totalPages)}
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer ${currentPage === totalPages
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setBatchPaginationPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Sonar Canvas + Verification Actions */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            {/* Top Action & Navigation Row */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                  {currentBatchImage.filename}
                </h3>
                {currentBatchImage.priority === 'High' && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>High Priority</span>
                  </span>
                )}
                {currentBatchImage.priority === 'Medium' && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span>Medium Priority</span>
                  </span>
                )}
                {currentBatchImage.priority === 'Low' && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span>Low Priority</span>
                  </span>
                )}
              </div>

              {/* Prev / Next Nav Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  disabled={currentIndex <= 0}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  disabled={currentIndex >= filteredBatchImages.length - 1}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* View Mode Tabs (Original Image vs Detected Objects) + Zoom HUD */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => setBatchViewTab('original')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${batchViewTab === 'original'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Original Image
                </button>
                <button
                  type="button"
                  onClick={() => setBatchViewTab('detected')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${batchViewTab === 'detected'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Detected Objects
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 text-slate-600">
                <button
                  type="button"
                  onClick={() => setBatchZoomLevel(z => Math.max(50, z - 25))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold w-9 text-center text-slate-700">
                  {batchZoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setBatchZoomLevel(z => Math.min(250, z + 25))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBatchZoomLevel(100)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Sonar Waterfall Canvas */}
            <div className="relative rounded-xl border border-slate-300 bg-black overflow-hidden aspect-16/10 flex items-center justify-center select-none shadow-inner">
              <div
                className="w-full h-full relative transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${batchZoomLevel / 100})`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={currentBatchImage.sonarImg}
                  alt={currentBatchImage.filename}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Overlaid Bounding Boxes when "Detected Objects" is active */}
                {batchViewTab === 'detected' &&
                  currentBatchImage.detections.map((d: BatchDetectionObject) => {
                    const isSelected = selectedDetectionCardId === d.id;
                    const review = detectionReviewMap[d.id];

                    let boxBorderColor = d.borderColor;
                    let boxBgColor = d.bgColor;
                    let boxTagBg = d.tagColor;

                    if (review?.status === 'confirmed') {
                      boxBorderColor = 'border-emerald-500';
                      boxBgColor = 'bg-emerald-500/15';
                      boxTagBg = 'bg-emerald-600';
                    } else if (review?.status === 'rejected') {
                      boxBorderColor = 'border-slate-400 opacity-40';
                      boxBgColor = 'bg-slate-500/10';
                      boxTagBg = 'bg-slate-500';
                    }

                    return (
                      <div
                        key={d.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetectionCardId(d.id);
                        }}
                        style={{
                          top: d.bbox.top,
                          left: d.bbox.left,
                          width: d.bbox.width,
                          height: d.bbox.height,
                        }}
                        className={`absolute border-2 rounded transition-all cursor-pointer group ${boxBorderColor} ${boxBgColor} ${isSelected
                          ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.7)] z-20'
                          : 'hover:ring-1 hover:ring-white/60 z-10'
                          }`}
                      >
                        {/* Detection Tag Header on Box */}
                        <div
                          className={`absolute -top-4 left-0 px-1 py-0.2 rounded text-[8.5px] font-mono font-bold text-white shadow-xs whitespace-nowrap flex items-center space-x-1 ${boxTagBg}`}
                        >
                          <span>#{d.orderNumber}</span>
                          <span>{review?.category || d.name}</span>
                          <span>({d.confidence}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Sonar Canvas HUD Overlay (Top-Right) */}
              <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md rounded-lg p-2 border border-slate-700/60 text-[9.5px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Time:</span>
                  <span className="text-emerald-400 font-bold">{currentBatchImage.timeHud}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Freq:</span>
                  <span className="text-slate-200">{currentBatchImage.frequency}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Swath:</span>
                  <span className="text-slate-200">{currentBatchImage.swath}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Speed:</span>
                  <span className="text-slate-200">{currentBatchImage.speed}</span>
                </div>
              </div>

              {/* Center Compass Watermark */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded text-[9.5px] font-mono text-white pointer-events-none">
                <div className="w-6 border-b border-white/60"></div>
                <span>50 m</span>
              </div>
            </div>
          </div>

          {/* Bottom Verification & Classification Action Bar */}
          {activeDetection ? (
            <div className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      Target #{activeDetection.orderNumber}: {activeReview?.category || activeDetection.name}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                      ({activeDetection.confidence}%)
                    </span>
                  </div>
                </div>

                {activeReview?.status && activeReview.status !== 'pending' && (
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeReview.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : activeReview.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                  >
                    <span>Status:</span>
                    <span className="capitalize">{activeReview.status}</span>
                  </span>
                )}
              </div>

              {/* Coordinates and Dimensions Row */}
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
                <span>Pos: {activeDetection.coordinates}</span>
                <span>Size: {activeDetection.size}</span>
              </div>

              {/* Verification Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOperatorVerify(activeDetection.id, 'CONFIRMED')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${activeReview?.status === 'confirmed'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOperatorVerify(activeDetection.id, 'REJECTED')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${activeReview?.status === 'rejected'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'border border-rose-200 bg-white hover:bg-rose-50 text-rose-600'
                    }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                {/* Classify Dropdown */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setIsClassifyDropdownOpen(!isClassifyDropdownOpen)}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Classify</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isClassifyDropdownOpen && (
                    <div className="absolute bottom-full mb-1.5 right-0 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-30 space-y-0.5">
                      <div className="px-2 py-1 text-[9.5px] font-mono uppercase font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                        <span>Correct Object Class</span>
                        <button
                          type="button"
                          onClick={() => setIsClassifyDropdownOpen(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      {[
                        { label: 'Sunken Container', icon: '📦' },
                        { label: 'Fishing Gear / Ghost Net', icon: '🕸️' },
                        { label: 'Marine Debris (Plastic/Metal)', icon: '🛢️' },
                        { label: 'Rock Outcrop / Natural Feature', icon: '🪨' },
                        { label: 'Shipwreck / Structural Hull', icon: '🚢' },
                        { label: 'Subsea Cable / Pipeline', icon: '⚡' },
                        { label: 'Unknown Anomaly', icon: '❓' },
                      ].map(cat => (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => {
                            handleOperatorVerify(activeDetection.id, 'CONFIRMED', cat.label);
                            setIsClassifyDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded-md text-[10.5px] font-medium hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{cat.icon} {cat.label}</span>
                          {activeReview?.category === cat.label && (
                            <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-[10.5px] text-slate-400">
              Select a detected object to review and classify.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Detections in This Image */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            {/* Header */}
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
              Detections in This Image ({currentBatchImage.detections.length})
            </h3>

            {/* List of Detection Cards (Max 4 items) */}
            <div className="space-y-2">
              {currentBatchImage.detections.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200/60">
                  No objects detected in this image.
                </div>
              ) : (
                currentBatchImage.detections.slice(0, 4).map((det: BatchDetectionObject) => {
                  const isSelected = selectedDetectionCardId === det.id;
                  const reviewInfo = detectionReviewMap[det.id];

                  const accentStripeColor =
                    det.color === 'red'
                      ? 'bg-rose-500'
                      : det.color === 'blue'
                        ? 'bg-blue-500'
                        : 'bg-amber-500';

                  const confidenceTextColor =
                    det.color === 'red'
                      ? 'text-rose-600'
                      : det.color === 'blue'
                        ? 'text-blue-600'
                        : 'text-amber-600';

                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetectionCardId(det.id)}
                      className={`rounded-lg border transition-all cursor-pointer overflow-hidden p-2 ${isSelected
                        ? 'border-blue-300 bg-blue-50/30 shadow-2xs ring-1 ring-blue-200'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                    >
                      {/* Card Title & Review Pill */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className={`w-1 h-3 rounded-full ${accentStripeColor} shrink-0`}></span>
                          <h4 className="text-[11px] font-bold text-slate-900 truncate">
                            {det.orderNumber}. {reviewInfo?.category || det.name}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          {reviewInfo?.status === 'confirmed' && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              ✓ Confirmed
                            </span>
                          )}
                          {reviewInfo?.status === 'rejected' && (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                              ✗ Rejected
                            </span>
                          )}
                          {reviewInfo?.status === 'classified' && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                              ✎ Tagged
                            </span>
                          )}
                          <span className={`text-[11px] font-black font-mono ${confidenceTextColor}`}>
                            {det.confidence}%
                          </span>
                        </div>
                      </div>

                      {/* Body with Thumbnail and Metadata */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <div className="w-11 h-11 rounded-md bg-black border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={
                              det.orderNumber === 1
                                ? '/sonar-tile-2.jpg'
                                : det.orderNumber === 2
                                  ? '/sonar-tile-3.jpg'
                                  : '/sonar-tile-1.jpg'
                            }
                            alt={det.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5 text-[10px]">
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Type</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[95px]">
                              {reviewInfo?.category || det.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Coordinates</span>
                            <span className="font-mono text-[9px] text-slate-700 truncate max-w-[95px]">
                              {det.coordinates}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Size (m)</span>
                            <span className="font-mono text-[9px] text-slate-700">
                              {det.size}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Tip */}
          <div className="pt-1 text-[9.5px] font-mono text-slate-400 text-center border-t border-slate-100">
            Click any detection to view & classify
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ANALYTICS & DISTRIBUTION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* Distribution Card: 100 Blocks Grid (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
            Detection Distribution Across All Images
          </h3>

          {/* 100-Block Visualization (Exact 50 columns x 2 rows) */}
          <div
            className="w-full py-0.5"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(50, minmax(0, 1fr))',
              gap: '2px',
            }}
          >
            {allBatchSurveyImages.map(img => {
              let blockBg = '#cbd5e1'; // slate-300
              if (img.priority === 'High') {
                blockBg = '#ef4444'; // rose-500
              } else if (img.priority === 'Medium') {
                blockBg = '#f59e0b'; // amber-500
              } else if (img.priority === 'Low') {
                blockBg = '#10b981'; // emerald-500
              }

              const isCurrent = img.id === selectedBatchImageId;

              return (
                <div
                  key={img.id}
                  onClick={() => {
                    setSelectedBatchImageId(img.id);
                    if (img.detections.length > 0) {
                      setSelectedDetectionCardId(img.detections[0].id);
                    }
                  }}
                  title={`${img.filename}: ${img.objectsCount} objects (${img.priority} Priority)`}
                  style={{ backgroundColor: blockBg }}
                  className={`h-3 rounded-[1.5px] transition-transform cursor-pointer hover:scale-125 ${isCurrent ? 'ring-2 ring-blue-600 scale-110 z-10' : ''
                    }`}
                ></div>
              );
            })}
          </div>

          {/* Legend and Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-slate-100">
            <div className="flex items-center space-x-3 text-[10.5px]">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-[1px] bg-rose-500"></span>
                <span className="text-[10.5px] font-medium text-slate-600">
                  High Priority ({batchSummaryStats.highPriority})
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-[1px] bg-amber-500"></span>
                <span className="text-[10.5px] font-medium text-slate-600">
                  Medium ({batchSummaryStats.medPriority})
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-[1px] bg-emerald-500"></span>
                <span className="text-[10.5px] font-medium text-slate-600">
                  Low ({batchSummaryStats.lowPriority})
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-[1px] bg-slate-300"></span>
                <span className="text-[10.5px] font-medium text-slate-600">
                  Images without detections ({batchSummaryStats.imagesWithoutDets})
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              Each block represents one image
            </span>
          </div>
        </div>

        {/* Priority Breakdown Card: Progress Bars (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Space_Grotesk']">
              Priority Breakdown ({batchSummaryStats.totalObjects} objects)
            </h3>
            <div className="relative group">
              <button
                type="button"
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Batch Export Options"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-30 hidden group-hover:block space-y-0.5 text-left">
                <button
                  type="button"
                  onClick={handleBatchDownloadAll}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Download All Processed
                </button>
                <button
                  type="button"
                  onClick={handleBatchDownloadDetectionsOnly}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Download Detections Only
                </button>
                <button
                  type="button"
                  onClick={handleBatchExportVerifiedOnly}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Export Verified Only
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5 text-xs">
            {/* High Priority Bar */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">High Priority</span>
                <span className="font-mono font-bold text-slate-900">
                  {batchSummaryStats.highPriority} ({batchSummaryStats.highPriorityPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${batchSummaryStats.highPriorityPercent}%` }}></div>
              </div>
            </div>

            {/* Medium Priority Bar */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">Medium Priority</span>
                <span className="font-mono font-bold text-slate-900">
                  {batchSummaryStats.medPriority} ({batchSummaryStats.medPriorityPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${batchSummaryStats.medPriorityPercent}%` }}></div>
              </div>
            </div>

            {/* Low Priority Bar */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">Low Priority</span>
                <span className="font-mono font-bold text-slate-900">
                  {batchSummaryStats.lowPriority} ({batchSummaryStats.lowPriorityPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${batchSummaryStats.lowPriorityPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
