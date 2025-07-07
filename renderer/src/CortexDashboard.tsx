import React, { useState, useEffect } from "react";
import { TopNavigationBar } from "./components/TopNavigationBar";
import { AppStack } from "./components/AppStack";
import { EnhancedSessionSidebar } from "./components/EnhancedSessionSidebar";
import { QuickSwitcher } from "./components/QuickSwitcher";
import { Spotlight } from "./components/Spotlight";
import { useRef } from 'react';

type Tab = { id: string; title: string; url?: string; isActive: boolean };
type App = {
  id: string;
  name: string;
  icon: "chrome" | "slack" | "vscode" | "folder";
  tabs: Tab[];
};
type LiveWorkspace = {
  apps: App[];
  activeAppId: string | null;
  activeWindowId: string | null;
};

export function CortexDashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const firstPauseRun = useRef(true);
  const [backgroundHidden, setBackgroundHidden] = useState(true);
  const [autoHideEnabled, setAutoHideEnabled] = useState(true);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // live workspace from main
  const [workspace, setWorkspace] = useState<LiveWorkspace>({
    apps: [],
    activeAppId: null,
    activeWindowId: null,
  });

  // Pause/resume side-effects
  useEffect(() => {
    if (firstPauseRun.current) {
      firstPauseRun.current = false;
      return;                    // skip on initial mount
    }
    if (isPaused) window.electron.pauseWorkspace();
    else          window.electron.resumeWorkspace();
  }, [isPaused]);

  // Background apps hide/show
  useEffect(() => {
    if (backgroundHidden) {
      window.electron.hideBackgroundApps();
    } else {
      window.electron.showAllApps();
    }
  }, [backgroundHidden]);

  // Toggle auto-hide on/off
  const toggleAutoHide = () => {
    setAutoHideEnabled(prev => {
      const next = !prev;
      if (next) window.electron.startAutoHide();
      else window.electron.stopAutoHide();
      return next;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live workspace updates
  useEffect(() => {
    window.electron.onLiveWorkspaceUpdate((liveWorkspace: LiveWorkspace) => {
      setWorkspace(liveWorkspace);
      if (liveWorkspace.activeAppId) {
        setExpandedStacks(prev =>
          prev.includes(liveWorkspace.activeAppId!)
            ? prev
            : [...prev, liveWorkspace.activeAppId!]
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

  const handleQuickSwitcherSelect = (item: any) => {
    console.log('Quick switcher selected:', item);
  };

  const handleSpotlightSearch = (query: string) => {
    console.log('Spotlight search:', query);
  };

  const handleSpotlightAI = (question: string) => {
    console.log('Spotlight AI question:', question);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigationBar
        sessionName={workspace.activeAppId || 'No Active Session'}
        isPaused={isPaused}
        backgroundAppsHidden={backgroundHidden}
        onPauseToggle={setIsPaused}
        onBackgroundAppsToggle={setBackgroundHidden}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      <div className="flex items-center p-4 bg-card border-b border-border">
        <span className="mr-4 text-sm text-muted-foreground">
          Auto-Hide: {autoHideEnabled ? 'On' : 'Off'}
        </span>
        <button
          onClick={toggleAutoHide}
          className="px-3 py-1 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition"
        >
          {autoHideEnabled ? 'Disable Auto-Hide' : 'Enable Auto-Hide'}
        </button>
      </div>

      <div className="flex flex-1 h-[calc(100vh-3.5rem-3rem)]">
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Workspace View */}
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
          onPauseToggle={() => setIsPaused(!isPaused)}
          onSettings={() => console.log('Settings opened')}
        />
      </div>

      <QuickSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        onSelect={handleQuickSwitcherSelect}
      />

      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSearch={handleSpotlightSearch}
        onAskAI={handleSpotlightAI}
      />
    </div>
  );
}
