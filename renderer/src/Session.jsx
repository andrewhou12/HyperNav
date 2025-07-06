import './index.css'; 
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CortexDashboard } from './CortexDashboard';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CortexDashboard />
  </StrictMode>
  );