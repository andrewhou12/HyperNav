import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  PenTool, 
  StickyNote, 
  Rocket, 
  Play, 
  Pause, 
  Home, 
  Plus, 
  Minus,
  AlertCircle,
  CheckCircle
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
}

export const CortexHUD: React.FC<CortexHUDProps> = ({
  className = "",
  isSessionActive = true,
  isCurrentAppInWorkspace = false,
  currentApp = "Chrome",
  statusMessage = "Tracking current window",
  statusType = "tracking",
  isVisible = true,
  onVisibilityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle Option + Space hotkey
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Option + Space (Alt + Space on Windows)
      if (event.altKey && event.code === 'Space') {
        event.preventDefault();
        if (!isVisible) {
          // If hidden, show and expand
          onVisibilityChange?.(true);
          setIsExpanded(true);
        } else {
          // If visible, toggle expansion
          setIsExpanded(!isExpanded);
        }
      }
      // ESC to close if expanded
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExpanded, onVisibilityChange]);

  // Close expanded view when HUD becomes hidden
  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

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

  const toggleHUD = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToolClick = (tool: string) => {
    console.log(`Opening ${tool}`);
    // Here you would implement the actual tool opening logic
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              // Collapsed floating mode
              <motion.div
                key="collapsed"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  duration: 0.15
                }}
                onClick={toggleHUD}
                className="glass glass-hover cursor-pointer rounded-2xl p-4 min-w-[200px] max-w-[280px]"
              >
            <div className="flex items-center gap-3">
            <img 
  src="/icons/cortexlogov1invert.svg"
  alt="Cortex"
  className="w-7 h-7 flex-shrink-0"
/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon()}
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    Cortex
                  </span>
                </div>
                {statusMessage && (
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    {statusMessage}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
            ) : (
              // Expanded control center
              <motion.div
                key="expanded"
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  duration: 0.15
                }}
                className="glass rounded-2xl p-4 w-80"
              >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
              <img 
  src="/icons/cortexlogov1invert.svg"
  alt="Cortex"
  className="w-7 h-7 flex-shrink-0"
/>
                <span className="font-medium text-sm">Cortex Control</span>
              </div>
                <button
                  onClick={toggleHUD}
                  className="w-6 h-6 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors"
                  title="Collapse (ESC)"
                >
                <Minus className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Tools Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
                onClick={() => handleToolClick('Spatial Navigator')}
                className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
              >
                <Brain className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs font-medium">Spatial Nav</div>
                <div className="text-xs text-muted-foreground">Navigate workspace</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
                onClick={() => handleToolClick('Inline GPT')}
                className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
              >
                <PenTool className="w-5 h-5 text-accent mb-2" />
                <div className="text-xs font-medium">Inline GPT</div>
                <div className="text-xs text-muted-foreground">AI assistance</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
                onClick={() => handleToolClick('Session Notes')}
                className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
              >
                <StickyNote className="w-5 h-5 text-orange-500 mb-2" />
                <div className="text-xs font-medium">Session Notes</div>
                <div className="text-xs text-muted-foreground">Quick capture</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
                onClick={() => handleToolClick('Smart Launcher')}
                className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
              >
                <Rocket className="w-5 h-5 text-green-500 mb-2" />
                <div className="text-xs font-medium">Smart Launch</div>
                <div className="text-xs text-muted-foreground">Quick access</div>
              </motion.button>
            </div>

            {/* Current App Display */}
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
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => handleToolClick(isSessionActive ? 'Pause' : 'Resume')}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors duration-150"
                >
                  {isSessionActive ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {isSessionActive ? 'Pause' : 'Resume'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => handleToolClick('Dashboard')}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors duration-150"
                >
                  <Home className="w-3 h-3" />
                  Dashboard
                </motion.button>
              </div>

              {/* Workspace Control */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
                onClick={() => handleToolClick(isCurrentAppInWorkspace ? 'Remove from Workspace' : 'Add to Workspace')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  isCurrentAppInWorkspace 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isCurrentAppInWorkspace ? (
                  <Minus className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                {isCurrentAppInWorkspace ? 'Remove from Workspace' : 'Add to Workspace'}
              </motion.button>
            </div>
          </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};