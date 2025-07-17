import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Map,
  Wrench,
  Rocket,
  Play,
  Pause,
  Home,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface CortexHUDProps {
  className?: string;
  isSessionActive?: boolean;
  isCurrentAppInWorkspace?: boolean;
  currentApp?: string;
  statusMessage?: string;
  statusType?: 'idle' | 'tracking' | 'alert' | 'success';
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onActivateOverlay?: (type: 'navigator' | 'gpt' | 'utilities' | 'launcher') => void;
  onToggleWorkspaceApp?: () => void;
  onToggleSession?: () => void;
  onGoToDashboard?: () => void;
}

export const CortexHUD: React.FC<CortexHUDProps> = ({
  className = '',
  isSessionActive = true,
  isCurrentAppInWorkspace = false,
  currentApp = 'Unknown',
  statusMessage = 'Tracking current window',
  statusType = 'tracking',
  isVisible = true,
  onVisibilityChange,
  onActivateOverlay,
  onToggleWorkspaceApp,
  onToggleSession,
  onGoToDashboard,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Hotkey: Option + Space
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === 'Space') {
        event.preventDefault();
        if (!isVisible) {
          onVisibilityChange?.(true);
          setIsExpanded(true);
        } else {
          setIsExpanded(prev => !prev);
        }
      }
      if (event.key === 'Escape' && isExpanded) {
        toggleHUD();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, isVisible, onVisibilityChange]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      if (isExpanded) toggleHUD();
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isExpanded]);

  const toggleHUD = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    const delay = newExpanded ? 0 : 180;
    setTimeout(() => {
      window.electron?.resizeHUDWindow(
        newExpanded
          ? { width: 320, height: 430 }
          : { width: 220, height: 70 }

          //w 220 h 70
      );
    }, delay);
  };

  const getStatusIcon = () => {
    switch (statusType) {
      case 'alert':
        return <AlertCircle className="w-3 h-3 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'tracking':
        return <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />;
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`flex items-center justify-center w-full h-full overflow-hidden ${className}`}>
      <motion.div
        animate={{
          height: isExpanded ? 420 : 100,
          opacity: 1,
          scale: 1,
        }}
        initial={false}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="glass rounded-md w-[360px] overflow-hidden p-4 border border-border/40"

        /* used to be glass rounded-2xl but would get clipped in hudwindow*/
      >
        {/* Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={toggleHUD}>
          <img
            src="./icons/cortexlogov3.svg"
            alt="Cortex"
            className="w-7 h-7 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <span className="text-xs font-medium text-muted-foreground truncate">Cortex</span>
            </div>
            {statusMessage && (
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Expanded Panel */}
        <motion.div
          animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
          initial={false}
          transition={{ duration: 0.15 }}
          className={`transition-opacity duration-150 mt-4 ${!isExpanded ? 'pointer-events-none overflow-hidden' : ''}`}
        >
          {/* Tools */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { icon: <Map className="w-5 h-5 text-primary mb-2" />, label: 'Spatial Nav', sub: 'Navigate workspace', type: 'navigator' },
              { icon: <Brain className="w-5 h-5 text-accent mb-2" />, label: 'Inline GPT', sub: 'AI assistance', type: 'gpt' },
              { icon: <Wrench className="w-5 h-5 text-orange-500 mb-2" />, label: 'Quick Utilities', sub: 'Tool Suite', type: 'utilities' },
              { icon: <Rocket className="w-5 h-5 text-green-500 mb-2" />, label: 'Smart Launch', sub: 'Quick access', type: 'launcher' },
            ].map(tool => (
              <button
                key={tool.label}
                onClick={() => onActivateOverlay?.(tool.type as CortexHUDProps['onActivateOverlay'] extends ((type: infer T) => any) ? T : never)}
                className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
              >
                {tool.icon}
                <div className="text-xs font-medium">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.sub}</div>
              </button>
            ))}
          </div>

          {/* Current App */}
<div className="border-t border-border/50 pt-3 pb-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-muted-foreground">Current Window</span>
    <span className="text-xs font-medium text-foreground">{currentApp}</span>
  </div>
</div>

          {/* Session Controls */}
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Session Control</span>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-xs text-muted-foreground">
                  {isSessionActive ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
            <button
  onClick={onToggleSession}
  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
    isSessionActive
      ? 'bg-secondary hover:bg-secondary/80 text-foreground'
      : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`}
>
  {isSessionActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
  {isSessionActive ? 'Pause' : 'Resume'}
</button>

              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors duration-150"
              >
                <Home className="w-3 h-3" />
                Dashboard
              </button>
            </div>

            <button
              onClick={onToggleWorkspaceApp}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                isCurrentAppInWorkspace
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isCurrentAppInWorkspace ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {isCurrentAppInWorkspace ? 'Remove from Workspace' : 'Add to Workspace'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
