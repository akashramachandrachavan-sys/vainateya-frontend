import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthPage } from './components/auth/AuthPage';

const rootElement = document.getElementById('auth-root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthPage />
    </StrictMode>,
  );
}
