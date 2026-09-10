/**
 * NaadvedhDashboard (Backward Compatibility Re-export)
 * 
 * The dashboard has been refactored into a clean modular architecture under:
 * - src/components/dashboard/Dashboard.tsx (Main orchestrator)
 * - src/components/dashboard/views/ (DashboardOverviewView, SurveyMapView, SurveysCatalogView, SurveySettingsView)
 * - src/components/dashboard/new-survey/ (NewSurveyWizard, Step 1-4 subcomponents, SupportedFormatsModal)
 * - src/components/dashboard/reports/ (ExecutivePdfReportDocument, ExecutiveReportPreviewModal, GenerateReportOptionsModal)
 * - src/components/dashboard/types/ (dashboard.types.ts)
 */

export { Dashboard as NaadvedhDashboard, Dashboard as default } from './Dashboard';
export * from './types/dashboard.types';
