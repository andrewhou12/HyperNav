import React, { useState, useEffect, useRef, SetStateAction } from "react";
import { TopNavigationBar } from "./components/TopNavigationBar";
import { AppStack } from "./components/AppStack";
import { EnhancedSessionSidebar } from "./components/EnhancedSessionSidebar";
import { SpatialNavigator } from "./components/SpatialNavigator";
import { InfiniteCanvas } from "./components/InfiniteCanvas";
import { SmartLauncher } from "./components/SmartLauncher";
import { CortexInlineAssistant } from "./components/CortexInlineAssistant";
import { CortexUtilities } from "./components/CortexUtilities";
import { CortexHUD } from "./components/CortexHUD";
import { Button } from "./components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./components/ui/resizable";
import { Grid3X3, Map, Plus } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export function CortexDashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundAppsHidden, setBackgroundAppsHidden] = useState(true);
  const [autoHideEnabled, setAutoHideEnabled] = useState(true);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [smartLauncherOpen, setSmartLauncherOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('grid');
  const [isNotebookExpanded, setIsNotebookExpanded] = useState(false);

  const firstPauseRun = useRef(true);

  const [workspace, setWorkspace] = useState({
    apps: [],
    activeAppId: null,
    activeWindowId: null,
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
      console.log(icons);
    }

    if (workspace.apps.length > 0) {
      loadIcons();
    }
  }, [workspace.apps]);

  useEffect(() => {
    const unsubscribe = window.electron.onLiveWorkspaceUpdate((liveWorkspace) => {
      setWorkspace(liveWorkspace);
      if (liveWorkspace.activeAppId) {
        setExpandedStacks(prev =>
          prev.includes(liveWorkspace.activeAppId) ? prev : [...prev, liveWorkspace.activeAppId]
        );
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'Tab') {
        setQuickNavOpen(true);
      }
      if (e.altKey && (e.key === 'Enter' || e.code === 'Enter')) {
        setSmartLauncherOpen(prev => !prev);
      }

      if (e.key === 'Escape') {
        if (quickNavOpen) setQuickNavOpen(false);
        if (smartLauncherOpen) setSmartLauncherOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickNavOpen, smartLauncherOpen]);

  const handleChangeIsPaused = (val: SetStateAction<boolean>) => {
    setIsPaused(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (newVal) {
        window.electron.pauseWorkspace();
      } else {
        window.electron.resumeWorkspace();
      }
      return newVal;
    });
  };

  const handleSave = () => {
    window.electron.saveSession();
  };

  const handleChangeIsBackgroundAppsHidden = (val: SetStateAction<boolean>) => {
    setBackgroundAppsHidden(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (newVal) {
        window.electron.showAllApps();
      } else {
        window.electron.clearWorkspace();
      }
      return newVal;
    });
  };

  const toggleAutoHide = () => {
    setAutoHideEnabled(prev => {
      const next = !prev;
      if (next) window.electron.startAutoHide();
      else window.electron.stopAutoHide();
      return next;
    });
  };

  const handleToggleStack = (stackId: string) => {
    setExpandedStacks(prev =>
      prev.includes(stackId) ? prev.filter(id => id !== stackId) : [...prev, stackId]
    );
  };

  const handleTabClick = (tabId: string) => {
    console.log('Tab clicked:', tabId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <TopNavigationBar
        sessionName={'New Session'}
        isPaused={isPaused}
        backgroundAppsHidden={backgroundAppsHidden}
        onBackgroundAppsToggle={handleChangeIsBackgroundAppsHidden}
        autoHideEnabled={autoHideEnabled}
        onPauseToggle={handleChangeIsPaused}
        onSave={handleSave}
        onAutoHideToggle={toggleAutoHide}
        onSettingsClick={() => {}}
      />

      <div className="flex flex-1 h-[calc(100vh-3.5rem-3rem)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={75} minSize={60}>
            <div className="p-6 overflow-y-auto h-screen">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Workspace</h1>
                    <p className="text-xs text-muted-foreground">
  {(workspace.apps?.filter(app => app.id === workspace.activeAppId)?.length || 0)} active • 
  {(workspace.apps?.reduce((acc, app) => acc + (app.tabs?.length || 0), 0) || 0)} total items
</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground hover:bg-gray-300'
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Grid
                    </button>

                    <button
                      onClick={() => setViewMode('canvas')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        viewMode === 'canvas'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground hover:bg-gray-300'
                      }`}
                      title="Canvas View"
                    >
                      <Map className="w-4 h-4" />
                      Canvas
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {workspace.apps.map(app => (
                      <AppStack
                        key={app.id}
                        name={app.name}
                        icon={app.icon}
                        tabs={app.tabs || []}
                        isExpanded={expandedStacks.includes(app.id)}
                        isActive={app.id === workspace.activeAppId}
                        onToggleExpanded={() => handleToggleStack(app.id)}
                        onTabClick={handleTabClick}
                        customIcon={appIcons[app.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-[600px] border border-border rounded-xl overflow-hidden">
                    <InfiniteCanvas />
                  </div>
                )}

                <div className="mt-12 p-4 bg-card border border-border rounded-xl">
                  <h3 className="text-sm font-medium text-foreground mb-3">Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌥</kbd>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                      <span>Spatial Navigator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌥</kbd>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                      <span>Cortex Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌥</kbd>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Return</kbd>
                      <span>Smart Launcher</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
            <EnhancedSessionSidebar
              isPaused={isPaused}
              onPauseToggle={() => handleChangeIsPaused(prev => !prev)}
              onSave={handleSave}
              onSettings={() => console.log('Settings opened')}
              isNotebookExpanded={isNotebookExpanded}
              onNotebookExpand={() => setIsNotebookExpanded(!isNotebookExpanded)}
            />
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {quickNavOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <SpatialNavigator
            isOpen={quickNavOpen}
            onClose={() => setQuickNavOpen(false)}
          />
        </div>
      )}

      {smartLauncherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <SmartLauncher
  isOpen={smartLauncherOpen}
  onClose={() => setSmartLauncherOpen(false)}
  withBackdrop={true}
  onChromeSearch={(query) => {
    if (window.electron?.openChromeWithSearch) {
      toast.loading(`Opening Chrome search for “${query}”`, { id: 'chrome-search' });

      window.electron.openChromeWithSearch(query)
        .then(() => {
          toast.success('Search opened in Chrome', { id: 'chrome-search' });
        })
        .catch((err) => {
          console.error('Failed to open Chrome search:', err);
          toast.error('Failed to open Chrome search', { id: 'chrome-search' });
        });
    } else {
      toast.error('Search function unavailable');
    }
  }}
/>
        </div>
      )}

{utilitiesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <CortexUtilities
            isOpen={utilitiesOpen}
            onClose={() => setUtilitiesOpen(false)}
          />
        </div>
      )}

{aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <CortexInlineAssistant
            isOpen={aiOpen}
            onClose={() => setAiOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
