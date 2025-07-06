import React from 'react';
import { useState } from "react";
import { Settings, Play, Pause, Eye, EyeOff } from "lucide-react";

interface WorkspaceControlsProps {
  onPauseToggle?: (isPaused: boolean) => void;
  onBackgroundAppsToggle?: (isHidden: boolean) => void;
  onSettingsClick?: () => void;
}

export function WorkspaceControls({ 
  onPauseToggle, 
  onBackgroundAppsToggle, 
  onSettingsClick 
}: WorkspaceControlsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundAppsHidden, setBackgroundAppsHidden] = useState(false);

  const handlePauseToggle = () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    onPauseToggle?.(newPauseState);
  };

  const handleBackgroundAppsToggle = () => {
    const newHiddenState = !backgroundAppsHidden;
    setBackgroundAppsHidden(newHiddenState);
    onBackgroundAppsToggle?.(newHiddenState);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Core Workspace Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePauseToggle}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isPaused 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-card text-card-foreground hover:bg-card-hover border '
            }
            shadow-dashboard hover:shadow-dashboard-hover
          `}
          title={isPaused ? 'Resume Cortex' : 'Pause Cortex'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        <button
          onClick={handleBackgroundAppsToggle}
          className="p-2 rounded-lg bg-card text-card-foreground hover:bg-card-hover border  transition-all duration-200 shadow-dashboard hover:shadow-dashboard-hover"
          title={backgroundAppsHidden ? 'Show Background Apps' : 'Hide Background Apps'}
        >
          {backgroundAppsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Settings */}
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-lg bg-card text-muted-foreground hover:text-card-foreground hover:bg-card-hover border  transition-all duration-200 shadow-dashboard hover:shadow-dashboard-hover"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}