import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Eye, EyeOff, Settings, HelpCircle, BookOpen, Target, Activity, Zap, Brain, RefreshCw } from "lucide-react";
import { Account } from "./Account";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavigationBarProps {
  isPaused?: boolean;
  backgroundAppsHidden?: boolean;
  autoHideEnabled?: boolean;
  onPauseToggle?: (paused: boolean) => void;
  onBackgroundAppsToggle?: (hidden: boolean) => void;
  onAutoHideToggle?: () => void;
  onSettingsClick?: () => void;
}

export function TopNavigationBar({
  isPaused = false,
  backgroundAppsHidden = false,
  autoHideEnabled = true,
  onPauseToggle,
  onBackgroundAppsToggle,
  onAutoHideToggle,
  onSettingsClick
}: TopNavigationBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const sessionName = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="h-14 px-6 bg-card border-b border-border flex items-center justify-between">

      {/* Left: Logo + Session Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden">
            <img
              src="./icons/cortexlogov3.svg"
              alt="Cortex logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-foreground">Cortex</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <span className="text-sm text-muted-foreground">{sessionName}</span>
      </div>

      {/* Center: Quick Actions */}
<div className="flex items-center gap-2">
  <button
    onClick={() => onPauseToggle?.(!isPaused)}
    className={`p-2 rounded-full transition-all duration-200 ${
      isPaused
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-muted text-muted-foreground hover:bg-gray-300'
    }`}
    title={isPaused ? 'Resume Session' : 'Pause Session'}
  >
    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
  </button>

  <button
    onClick={() => onBackgroundAppsToggle?.(!backgroundAppsHidden)}
    className={`p-2 rounded-full transition-all duration-200 ${
      backgroundAppsHidden
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-muted text-muted-foreground hover:bg-gray-300'
    }`}
    title={backgroundAppsHidden ? 'Show Background Apps' : 'Hide Background Apps'}
  >
    {backgroundAppsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>

  <button
    onClick={onAutoHideToggle}
    className={`p-2 rounded-full transition-all duration-200 ${
      autoHideEnabled
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-muted text-muted-foreground hover:bg-gray-300'
    }`}
    title={autoHideEnabled ? 'Disable Auto-Hide' : 'Enable Auto-Hide'}
  >
    <RefreshCw className="w-4 h-4" />
  </button>

  <button
    onClick={onSettingsClick}
    className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-gray-300 transition-all duration-200"
    title="Settings"
  >
    <Settings className="w-4 h-4" />
  </button>
</div>

{/* Right: Account + Time */}
<div className="flex items-center gap-4">
        <Account 
          onExportData={() => console.log('Export data triggered')}
          onDeleteData={() => console.log('Delete data triggered')}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200"
              title="Help & Tips"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuItem asChild>
              <Link to="/components/help/smart-launcher" className="flex items-center gap-3 p-3 cursor-pointer">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">Intro to Cortex</div>
                  <div className="text-xs text-muted-foreground">Get started with Cortex basics</div>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/components/help/spatial-navigator" className="flex items-center gap-3 p-3 cursor-pointer">
                <Target className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium">10x Your Focus with Spatial Navigator</div>
                  <div className="text-xs text-muted-foreground">Master workspace organization</div>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/components/help/data-tracking" className="flex items-center gap-3 p-3 cursor-pointer">
                <Activity className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="font-medium">What Cortex Tracks & Why</div>
                  <div className="text-xs text-muted-foreground">Understanding your productivity data</div>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link to="/components/help/keyboard-shortcuts" className="flex items-center gap-3 p-3 cursor-pointer">
                <Zap className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="font-medium">Keyboard Shortcuts</div>
                  <div className="text-xs text-muted-foreground">Work faster with hotkeys</div>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/components/help/ai-assistant" className="flex items-center gap-3 p-3 cursor-pointer">
                <Brain className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="font-medium">AI Assistant Tips</div>
                  <div className="text-xs text-muted-foreground">Get the most from Cortex Intelligence</div>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        
        <div className="text-sm text-muted-foreground font-mono">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
