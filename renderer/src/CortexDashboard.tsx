import { useState, useEffect } from "react";
import { TopNavigationBar } from "./components/TopNavigationBar";
import { AppStack } from "./components/AppStack";
import { EnhancedSessionSidebar } from "./components/EnhancedSessionSidebar";
import { QuickSwitcher } from "./components/QuickSwitcher";
import { Spotlight } from "./components/Spotlight";


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
  const [backgroundAppsHidden, setBackgroundAppsHidden] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // 2) Replace mockApps with real workspace from main process
  const [workspace, setWorkspace] = useState<LiveWorkspace>({
    apps: [],
    activeAppId: null,
    activeWindowId: null
  });
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Option + Tab for Quick Switcher
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
      
      // Option + Space for Spotlight
      if (e.altKey && e.key === ' ') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }

      // Cmd/Ctrl + K for Quick Switcher (alternative)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  window.electron.onLiveWorkspaceUpdate((liveWorkspace: LiveWorkspace) => {
    setWorkspace(liveWorkspace);
    // optionally auto-expand the active app
    if (liveWorkspace.activeAppId) {
      setExpandedStacks(prev =>
        prev.includes(liveWorkspace.activeAppId!)
          ? prev
          : [...prev, liveWorkspace.activeAppId!]
      );
    }
  });
 
  const handleToggleStack = (stackId: string) => {
    setExpandedStacks(prev => 
      prev.includes(stackId) 
        ? prev.filter(id => id !== stackId)
        : [...prev, stackId]
    );
  };

  const handleTabClick = (tabId: string) => {
    console.log('Tab clicked:', tabId);
    // Handle tab switching logic
  };

  const handleQuickSwitcherSelect = (item: any) => {
    console.log('Quick switcher selected:', item);
    // Handle quick switcher selection
  };

  const handleSpotlightSearch = (query: string) => {
    console.log('Spotlight search:', query);
    // Handle spotlight search
  };

  const handleSpotlightAI = (question: string) => {
    console.log('Spotlight AI question:', question);
    // Handle AI question
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigationBar
        sessionName={workspace.activeAppId || "No Active Session"}
        isPaused={isPaused}
        backgroundAppsHidden={backgroundAppsHidden}
        onPauseToggle={setIsPaused}
        onBackgroundAppsToggle={setBackgroundAppsHidden}
        onSettingsClick={() => console.log("Settings clicked")}
      />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)]">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Workspace</h1>
              <p className="text-muted-foreground">
                {
                  workspace.apps.filter(app => app.id === workspace.activeAppId)
                    .length
                }{" "}
                active •{" "}
                {workspace.apps.reduce((acc, app) => acc + app.tabs.length, 0)}{" "}
                total items
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

            <div className="mt-12 p-4 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌥</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                  <span>Quick Switcher</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌥</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                  <span>Spotlight Search</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EnhancedSessionSidebar
          isPaused={isPaused}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onSave={() => console.log("Session saved")}
          onSettings={() => console.log("Settings opened")}
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
