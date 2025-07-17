import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CortexLauncher } from './CortexLauncher';
import { CortexDashboard } from './CortexDashboard';

import OverlayApp from './OverlayApp';
import HUD from './HUD';
import Onboarding from './Onboarding';
import SmartLauncher from "./components/help/SmartLauncher";
import SpatialNavigator from "./components/help/SpatialNavigator";
import DataTracking from "./components/help/DataTracking";
import KeyboardShortcuts from "./components/help/KeyboardShortcuts";
import AIAssistant from "./components/help/AIAssistant";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CortexLauncher />} />
        <Route path="/session" element={<CortexDashboard />} />
        <Route path="/overlay" element={<OverlayApp />} />
        <Route path="/hud" element={<HUD />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/components/help/smart-launcher" element={<SmartLauncher />} />
        <Route path="/components/help/spatial-navigator" element={<SpatialNavigator />} />
        <Route path="/components/help/data-tracking" element={<DataTracking />} />
        <Route path="/components/help/keyboard-shortcuts" element={<KeyboardShortcuts />} />
        <Route path="/components/help/ai-assistant" element={<AIAssistant />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
