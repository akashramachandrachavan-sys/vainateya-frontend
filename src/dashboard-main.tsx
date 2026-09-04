import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { NaadvedhDashboard } from './components/dashboard/NaadvedhDashboard';

const rootElement = document.getElementById('dashboard-root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <NaadvedhDashboard />
    </StrictMode>,
  );
}
