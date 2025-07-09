import React, { useState, useEffect } from 'react';
import { SpatialNavigator } from './components/SpatialNavigator';

export default function OverlayApp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.onShow(() => setIsOpen(true));
    window.electron.ipcRenderer.onHide(() => setIsOpen(false));
  }, []);

    return <SpatialNavigator
    isOpen={isOpen}
    onClose={() => window.electron.hideOverlay()}
  />
  }


