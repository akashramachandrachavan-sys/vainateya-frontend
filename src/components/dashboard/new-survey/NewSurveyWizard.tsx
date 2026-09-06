import React from 'react';
import {
  CheckCircle2,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import { Step1SurveyDetails } from './Step1SurveyDetails';
import { Step2UploadSonar } from './Step2UploadSonar';
import { Step3Processing } from './Step3Processing';
import { Step4Results } from './Step4Results';
import { SupportedFormatsModal } from './SupportedFormatsModal';
import type {
  DashboardScreen,
  UploadedFileItem,
  BatchImageResult,
  BatchSummaryStats,
} from '../types/dashboard.types';

interface NewSurveyWizardProps {
  newSurveyStep: 1 | 2 | 3 | 4;
  setNewSurveyStep: (step: 1 | 2 | 3 | 4) => void;
  isSurveyDetailsLocked: boolean;
  setIsSurveyDetailsLocked: (locked: boolean) => void;
  isProcessingComplete: boolean;
  setCurrentScreen: (screen: DashboardScreen) => void;

  // Step 1 props
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
  handleCreateSurveyStep1: () => void;

  // Step 2 props
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
  isSupportedFormatsModalOpen: boolean;
  setIsSupportedFormatsModalOpen: (open: boolean) => void;
  handleStartProcessingStep2: () => void;

  // Step 3 props
  processingProgress: number;
  activeStage: number;
  elapsedSeconds: number;

  // Step 4 props
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
  handleExportCSV: () => void;
  setIsReportModalOpen: (open: boolean) => void;
}

export const NewSurveyWizard: React.FC<NewSurveyWizardProps> = ({
  newSurveyStep,
  setNewSurveyStep,
  isSurveyDetailsLocked,
  setIsSurveyDetailsLocked,
  isProcessingComplete,
  setCurrentScreen,

  // Step 1
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
  handleCreateSurveyStep1,

  // Step 2
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
  isSupportedFormatsModalOpen,
  setIsSupportedFormatsModalOpen,
  handleStartProcessingStep2,

  // Step 3
  processingProgress,
  activeStage,
  elapsedSeconds,

  // Step 4
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
  handleExportCSV,
  setIsReportModalOpen,
}) => {
  return (
    <main
      className={`w-full mx-auto ${newSurveyStep === 4 ? 'px-3.5 py-2 space-y-2 max-w-[1600px]' : 'p-3.5 sm:p-4 lg:p-5 space-y-3 max-w-7xl'
        }`}
    >
      {/* Title & Subtitle + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1
            className={`${newSurveyStep === 4 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              } font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-tight`}
          >
            {newSurveyStep === 4 ? 'Survey Results' : 'New Survey'}
          </h1>
          {newSurveyStep !== 4 && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload side-scan sonar imagery to detect and classify underwater debris and anomalies.
            </p>
          )}
        </div>

        {newSurveyStep === 4 && (
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] shadow-2xs whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="flex items-center space-x-1.5">
                <span className="font-bold">Processing Completed</span>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] font-mono text-emerald-700">
                  {batchSummaryStats.totalImages} / {batchSummaryStats.totalImages} images processed
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3 h-3 text-slate-500" />
              <span>Generate Report</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3 h-3" />
              <span>Export Results</span>
            </button>
          </div>
        )}
      </div>

      {/* 4-Step Stepper Header */}
      <div
        className={`flex items-center max-w-2xl text-[11px] font-mono font-bold ${newSurveyStep === 4 ? 'pt-0 pb-0' : 'pt-0 pb-1 text-xs'
          }`}
      >
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => {
            if (newSurveyStep === 2) {
              setIsSurveyDetailsLocked(false);
              setNewSurveyStep(1);
            }
          }}
          disabled={newSurveyStep !== 2}
          className={`flex items-center space-x-1.5 transition-colors ${newSurveyStep === 1
            ? 'text-blue-600 cursor-default'
            : newSurveyStep === 2
              ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'text-slate-400 cursor-not-allowed opacity-80'
            }`}
          title={newSurveyStep >= 3 ? 'Survey details are locked during processing' : undefined}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 1
              ? 'bg-blue-600 text-white'
              : 'bg-blue-600 text-white shadow-xs'
              }`}
          >
            {newSurveyStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
          </div>
          <span>Survey Details</span>
        </button>

        {/* Line 1-2 */}
        <div
          className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}
        ></div>

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => {
            if (newSurveyStep === 1 && isSurveyDetailsLocked) {
              setNewSurveyStep(2);
            }
          }}
          disabled={newSurveyStep !== 2 && !(newSurveyStep === 1 && isSurveyDetailsLocked)}
          className={`flex items-center space-x-1.5 transition-colors ${newSurveyStep === 2
            ? 'text-blue-600 cursor-default'
            : newSurveyStep > 2
              ? 'text-blue-600 cursor-not-allowed opacity-80'
              : isSurveyDetailsLocked
                ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          title={
            newSurveyStep >= 3
              ? 'Upload data is locked during processing'
              : !isSurveyDetailsLocked
                ? 'Complete Survey Details and click Next: Upload Data below'
                : undefined
          }
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 2
              ? 'bg-blue-600 text-white'
              : newSurveyStep === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500'
              }`}
          >
            {newSurveyStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
          </div>
          <span>Upload Data</span>
        </button>

        {/* Line 2-3 */}
        <div
          className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}
        ></div>

        {/* Step 3 */}
        <button
          type="button"
          disabled={newSurveyStep !== 3}
          className={`flex items-center space-x-1.5 transition-colors ${newSurveyStep === 3
            ? 'text-blue-600 cursor-default'
            : newSurveyStep > 3
              ? 'text-blue-600 cursor-default opacity-80'
              : 'text-slate-400 cursor-not-allowed'
            }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep > 3
              ? 'bg-blue-600 text-white'
              : newSurveyStep === 3
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500'
              }`}
          >
            {newSurveyStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
          </div>
          <span>Processing</span>
        </button>

        {/* Line 3-4 */}
        <div
          className={`flex-1 h-0.5 mx-2.5 ${newSurveyStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`}
        ></div>

        {/* Step 4 */}
        <button
          type="button"
          onClick={() => {
            if (newSurveyStep === 3 && isProcessingComplete) {
              setNewSurveyStep(4);
            }
          }}
          disabled={newSurveyStep !== 4 && !(newSurveyStep === 3 && isProcessingComplete)}
          className={`flex items-center space-x-1.5 transition-colors ${newSurveyStep === 4
            ? 'text-blue-600 cursor-default'
            : newSurveyStep === 3 && isProcessingComplete
              ? 'text-emerald-600 hover:text-emerald-700 cursor-pointer'
              : 'text-slate-400 cursor-not-allowed'
            }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${newSurveyStep === 4
              ? 'bg-blue-600 text-white shadow-xs'
              : newSurveyStep === 3 && isProcessingComplete
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500'
              }`}
          >
            4
          </div>
          <span>Results</span>
        </button>
      </div>

      {/* Render Steps */}
      {newSurveyStep === 1 && (
        <Step1SurveyDetails
          surveyName={surveyName}
          setSurveyName={setSurveyName}
          surveyDate={surveyDate}
          setSurveyDate={setSurveyDate}
          surveyLocation={surveyLocation}
          setSurveyLocation={setSurveyLocation}
          surveyDescription={surveyDescription}
          setSurveyDescription={setSurveyDescription}
          surveyDetailsError={surveyDetailsError}
          setSurveyDetailsError={setSurveyDetailsError}
          onCancel={() => setCurrentScreen('dashboard')}
          onNext={handleCreateSurveyStep1}
        />
      )}

      {newSurveyStep === 2 && (
        <Step2UploadSonar
          fileInputRef={fileInputRef}
          handleFileInputChange={handleFileInputChange}
          handleAddFiles={handleAddFiles}
          handleDropFiles={handleDropFiles}
          isDraggingFile={isDraggingFile}
          setIsDraggingFile={setIsDraggingFile}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          handleRemoveFile={handleRemoveFile}
          batchViewMode={batchViewMode}
          setBatchViewMode={setBatchViewMode}
          setIsSupportedFormatsModalOpen={setIsSupportedFormatsModalOpen}
          onBack={() => {
            setIsSurveyDetailsLocked(false);
            setNewSurveyStep(1);
          }}
          onStartProcessing={handleStartProcessingStep2}
        />
      )}

      {newSurveyStep === 3 && (
        <Step3Processing
          selectedFiles={selectedFiles}
          processingProgress={processingProgress}
          isProcessingComplete={isProcessingComplete}
          activeStage={activeStage}
          elapsedSeconds={elapsedSeconds}
          batchSummaryStats={batchSummaryStats}
          onViewResults={() => setNewSurveyStep(4)}
        />
      )}

      {newSurveyStep === 4 && (
        <Step4Results
          allBatchSurveyImages={allBatchSurveyImages}
          batchSummaryStats={batchSummaryStats}
          batchFilterTab={batchFilterTab}
          setBatchFilterTab={setBatchFilterTab}
          batchSearchQuery={batchSearchQuery}
          setBatchSearchQuery={setBatchSearchQuery}
          batchSortBy={batchSortBy}
          setBatchSortBy={setBatchSortBy}
          batchPaginationPage={batchPaginationPage}
          setBatchPaginationPage={setBatchPaginationPage}
          selectedBatchImageId={selectedBatchImageId}
          setSelectedBatchImageId={setSelectedBatchImageId}
          selectedDetectionCardId={selectedDetectionCardId}
          setSelectedDetectionCardId={setSelectedDetectionCardId}
          batchSelectedImageIds={batchSelectedImageIds}
          setBatchSelectedImageIds={setBatchSelectedImageIds}
          batchViewTab={batchViewTab}
          setBatchViewTab={setBatchViewTab}
          batchZoomLevel={batchZoomLevel}
          setBatchZoomLevel={setBatchZoomLevel}
          detectionReviewMap={detectionReviewMap}
          isClassifyDropdownOpen={isClassifyDropdownOpen}
          setIsClassifyDropdownOpen={setIsClassifyDropdownOpen}
          handleOperatorVerify={handleOperatorVerify}
          handleBatchDownloadAll={handleBatchDownloadAll}
          handleBatchDownloadDetectionsOnly={handleBatchDownloadDetectionsOnly}
          handleBatchExportVerifiedOnly={handleBatchExportVerifiedOnly}
        />
      )}

      {/* Supported Formats Modal */}
      <SupportedFormatsModal
        isOpen={isSupportedFormatsModalOpen}
        onClose={() => setIsSupportedFormatsModalOpen(false)}
      />
    </main>
  );
};
