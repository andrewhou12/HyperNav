import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CortexLauncher } from './CortexLauncher';
import { CortexDashboard } from './CortexDashboard';

import OverlayApp from './OverlayApp';
import HUD from './HUD';
import Onboarding from './Onboarding';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CortexLauncher />} />
        <Route path="/session" element={<CortexDashboard />} />
        <Route path="/overlay" element={<OverlayApp />} />
        <Route path="/hud" element={<HUD />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
