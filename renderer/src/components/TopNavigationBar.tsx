import React, { useState, useEffect } from 'react';
import { Pause, Play, Eye, EyeOff, Settings, RefreshCw } from 'lucide-react';

interface TopNavigationBarProps {
  sessionName?: string;
  isPaused?: boolean;
  backgroundAppsHidden?: boolean;
  autoHideEnabled?: boolean;
  onPauseToggle?: (paused: boolean) => void;
  onBackgroundAppsToggle?: (hidden: boolean) => void;
  onAutoHideToggle?: () => void;
  onSettingsClick?: () => void;
}

export function TopNavigationBar({
  sessionName = 'Session',
  isPaused = false,
  backgroundAppsHidden = true,
  autoHideEnabled = true,
  onPauseToggle,
  onBackgroundAppsToggle,
  onAutoHideToggle,
  onSettingsClick,
}: TopNavigationBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-14 px-6 bg-card border-b border-border flex items-center justify-between">
      {/* Left: Logo + Session Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden">
            <img
              src="/icons/cortexlogov1invert.svg"
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
        {/* Pause / Play */}
        <button
          onClick={async () => {
            if (isPaused) {
              onPauseToggle?.(false);
            } else {
              onPauseToggle?.(true);
            }
          }}
          className={
            `p-2 rounded-full transition-all duration-200 ` +
            (isPaused
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )
          }
          title={isPaused ? 'Resume Session' : 'Pause Session'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Show / Hide Background Apps */}
        <button
          onClick={async () => {
            if (backgroundAppsHidden) {
              onBackgroundAppsToggle?.(false);
            } else {
              onBackgroundAppsToggle?.(true);
            }
          }}
          className={
            `p-2 rounded-full transition-all duration-200 ` +
            (backgroundAppsHidden
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )
          }
          title={backgroundAppsHidden ? 'Show Background Apps' : 'Hide Background Apps'}
        >
          {backgroundAppsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Auto-Hide Toggle */}
        <button
          onClick={onAutoHideToggle}
          className={
            `p-2 rounded-full transition-all duration-200 ` +
            (autoHideEnabled
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )
          }
          title={autoHideEnabled ? 'Disable Auto-Hide' : 'Enable Auto-Hide'}
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Clock */}
      <div className="text-sm text-muted-foreground font-mono">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
