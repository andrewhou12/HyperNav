import React, { useState, useEffect } from 'react';
import { SpatialNavigator } from './components/SpatialNavigator';
import { SmartLauncher } from './components/SmartLauncher';
import { CortexInlineAssistant } from './components/CortexInlineAssistant';
import { CortexUtilities } from './components/CortexUtilities';
import { Toaster, toast } from 'react-hot-toast';

export default function OverlayApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);  // 'navigator' | 'launcher' | 'ai' | 'utilities'
  const [workspace, setWorkspace] = useState({
    apps: [],
    activeAppId: null,
    activeWindowId: null
  });
  
  const [appIcons, setAppIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadIcons() {
      const icons: Record<string, string> = {};
      for (const app of workspace.apps) {
        if (!app.path) continue;
        const icon = await window.electron.getAppIcon?.(app.path);
        if (icon) icons[app.id] = icon;
      }
      setAppIcons(icons);
    }
  
    if (workspace.apps.length > 0) {
      loadIcons();
    }
  }, [workspace.apps]);

  useEffect(() => {
    console.log("Overlay useEffect mounted");
    const unsubscribe = window.electron.onLiveWorkspaceUpdate?.((liveWorkspace) => {
      console.log("🔁 liveWorkspace update via listener:", liveWorkspace);
      setWorkspace(liveWorkspace);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleShow = (_, overlayType) => {
      setActiveOverlay(overlayType);
      setIsOpen(true);
    };

    const handleHide = () => {
      setIsOpen(false);
      setActiveOverlay(null);
    };

    window.electron.ipcRenderer.onShow(handleShow);
    window.electron.ipcRenderer.onHide(handleHide);

    return () => {
      window.electron.ipcRenderer.removeShow(handleShow);
      window.electron.ipcRenderer.removeHide(handleHide);
    };
  }, []);

  const handleClose = (reason) => {
    window.electron.hideOverlay(reason);
    console.log('Overlay closed:', reason);
  };

  const handleChromeSearch = (query) => {
    if (window.electron?.openChromeWithSearch) {
      toast.loading(`Opening Chrome search for “${query}”`, { id: 'chrome-search' });

      window.electron.openChromeWithSearch(query)
        .then(() => {
          toast.success('Search opened in Chrome', { id: 'chrome-search' });
        })
        .catch((err) => {
          console.error('❌ Failed to open Chrome search:', err);
          toast.error('Failed to open Chrome search', { id: 'chrome-search' });
        });
    } else {
      toast.error('Search function unavailable');
    }
  };

  const renderOverlay = () => {
    switch (activeOverlay) {
      case 'navigator':
  return (
    <SpatialNavigator
      isOpen={isOpen}
      onClose={handleClose}
      workspace={workspace}
      appIcons={appIcons}
    />
  );

      case 'launcher':
        return (
          <div className="p-4 scrollbar-hidden overflow-auto max-h-[400px]">
            <SmartLauncher 
              isOpen={isOpen} 
              onClose={handleClose} 
              withBackdrop={false}
              onChromeSearch={handleChromeSearch}
            />
          </div>
        );

      case 'ai':
        return <CortexInlineAssistant isOpen={isOpen} onClose={handleClose} />;

      case 'utilities':
        return <CortexUtilities isOpen={isOpen} onClose={handleClose} />;

      default:
        return null;
    }
  };

  return (
    <>
      {renderOverlay()}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: `
            glass 
            rounded-xl 
            border border-border 
            shadow-lg 
            text-foreground 
            backdrop-blur-xl 
            px-4 py-3
            text-sm
          `,
          duration: 2000,
          success: {
            className: `
              glass 
              border border-border 
              text-foreground 
              bg-[hsl(var(--primary)/0.9)] 
              text-[hsl(var(--primary-foreground))]
              rounded-xl
              px-4 py-3
              shadow-lg
            `
          },
          error: {
            className: `
              glass 
              border border-border 
              text-foreground 
              bg-[hsl(var(--destructive)/0.9)] 
              text-[hsl(var(--destructive-foreground))]
              rounded-xl
              px-4 py-3
              shadow-lg
            `
          },
        }}
      />
    </>
  );
}
