import React, { useState, useEffect, useRef, SetStateAction } from "react";
import { TopNavigationBar } from "./components/TopNavigationBar";
import { AppStack } from "./components/AppStack";
import { EnhancedSessionSidebar } from "./components/EnhancedSessionSidebar";

export function CortexDashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundAppsHidden, setBackgroundAppsHidden] = useState(true);
  const [autoHideEnabled, setAutoHideEnabled] = useState(true);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);

  const firstPauseRun = useRef(true);

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

  const [workspace, setWorkspace] = useState({
    apps: [],
    activeAppId: null,
    activeWindowId: null,
  });

  const toggleAutoHide = () => {
    setAutoHideEnabled(prev => {
      const next = !prev;
      if (next) window.electron.startAutoHide();
      else window.electron.stopAutoHide();
      return next;
    });
  };

  useEffect(() => {
    window.electron.onLiveWorkspaceUpdate((liveWorkspace) => {
      setWorkspace(liveWorkspace);
      if (liveWorkspace.activeAppId) {
        setExpandedStacks(prev =>
          prev.includes(liveWorkspace.activeAppId) ? prev : [...prev, liveWorkspace.activeAppId]
        );
      }
    });
  }, []);

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
      <TopNavigationBar
        sessionName={'New Session'}
        isPaused={isPaused}
        backgroundAppsHidden={backgroundAppsHidden}
        onBackgroundAppsToggle={handleChangeIsBackgroundAppsHidden}
        autoHideEnabled={autoHideEnabled}
        onPauseToggle={handleChangeIsPaused}
        onAutoHideToggle={toggleAutoHide}
        onSettingsClick={() => {}}
      />

      <div className="flex flex-1 h-[calc(100vh-3.5rem-3rem)]">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Workspace</h1>
              <p className="text-muted-foreground">
                {workspace.apps.filter(app => app.id === workspace.activeAppId).length} active •{' '}
                {workspace.apps.reduce((acc, app) => acc + app.tabs.length, 0)} total items
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workspace.apps.map(app => (
                <AppStack
                  key={app.id}
                  name={app.name}
                  icon={app.icon}
                  tabs={app.tabs}
                  isExpanded={expandedStacks.includes(app.id)}
                  isActive={app.id === workspace.activeAppId}
                  onToggleExpanded={() => handleToggleStack(app.id)}
                  onTabClick={handleTabClick}
                />
              ))}
            </div>
          </div>
        </div>

        <EnhancedSessionSidebar
          isPaused={isPaused}
          onPauseToggle={() => handleChangeIsPaused(prev => !prev)}
          onSettings={() => console.log('Settings opened')}
        />
      </div>
    </div>
  );
} 
