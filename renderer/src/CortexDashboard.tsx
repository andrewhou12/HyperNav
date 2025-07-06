import { useState, useEffect } from "react";
import { TopNavigationBar } from "./components/TopNavigationBar";
import { AppStack } from "./components/AppStack";
import { EnhancedSessionSidebar } from "./components/EnhancedSessionSidebar";
import { QuickSwitcher } from "./components/QuickSwitcher";
import { Spotlight } from "./components/Spotlight";



const mockApps = [
  {
    id: 'chrome',
    name: "Google Chrome",
    icon: "chrome" as const,
    tabs: [
      { id: 'gmail', title: 'Gmail - Inbox', url: 'gmail.com', isActive: true },
      { id: 'github', title: 'GitHub Dashboard', url: 'github.com', isActive: false },
      { id: 'docs', title: 'Q3 Launch Plan - Google Docs', url: 'docs.google.com', isActive: false },
    ],
    isActive: true,
  },
  {
    id: 'slack',
    name: "Slack",
    icon: "slack" as const,
    tabs: [
      { id: 'marketing', title: 'Marketing Channel', isActive: false },
      { id: 'general', title: 'General', isActive: false },
      { id: 'random', title: 'Random', isActive: false },
    ],
    isActive: false,
  },
  {
    id: 'vscode',
    name: "VS Code",
    icon: "vscode" as const,
    tabs: [
      { id: 'app', title: 'CortexDashboard.tsx', isActive: false },
      { id: 'styles', title: 'dashboard.css', isActive: false },
      { id: 'readme', title: 'README.md', isActive: false },
    ],
    isActive: false,
  },
  {
    id: 'work-folder',
    name: "Work Projects",
    icon: "folder" as const,
    tabs: [
      { id: 'presentation', title: 'Q3 Launch Presentation', isActive: false },
      { id: 'budget', title: 'Marketing Budget 2024', isActive: false },
      { id: 'roadmap', title: 'Product Roadmap', isActive: false },
      { id: 'metrics', title: 'Weekly Metrics Report', isActive: false },
      { id: 'proposals', title: 'Client Proposals', isActive: false },
    ],
    isActive: false,
  },
];

export function CortexDashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundAppsHidden, setBackgroundAppsHidden] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState<string[]>(['chrome']);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

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
      {/* Top Navigation */}
      <TopNavigationBar
        sessionName="Session 4"
        isPaused={isPaused}
        backgroundAppsHidden={backgroundAppsHidden}
        onPauseToggle={(paused) => setIsPaused(paused)}
        onBackgroundAppsToggle={(hidden) => setBackgroundAppsHidden(hidden)}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)]">
        {/* Center Panel - Stack View */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Workspace</h1>
              <p className="text-muted-foreground">
                {mockApps.filter(app => app.isActive).length} active • {mockApps.reduce((acc, app) => acc + app.tabs.length, 0)} total items
              </p>
            </div>

            {/* App Stacks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockApps.map((app) => (
                <AppStack
                  key={app.id}
                  name={app.name}
                  icon={app.icon}
                  tabs={app.tabs}
                  isExpanded={expandedStacks.includes(app.id)}
                  isActive={app.isActive}
                  onToggleExpanded={() => handleToggleStack(app.id)}
                  onTabClick={handleTabClick}
                />
              ))}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-12 p-4 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</h3>
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

        {/* Right Sidebar - Enhanced Session */}
        <EnhancedSessionSidebar
          isPaused={isPaused}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onSave={() => console.log('Session saved')}
          onSettings={() => console.log('Settings opened')}
        />
      </div>

      {/* Overlays */}
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
