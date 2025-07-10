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
  isTracking?: boolean;
  statusMessage?: string;
  statusType?: 'idle' | 'tracking' | 'alert' | 'success';
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const CortexHUD: React.FC<CortexHUDProps> = ({
  className = "",
  isTracking = true,
  statusMessage = "Tracking current session",
  statusType = "tracking",
  isVisible = true,
  onVisibilityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExpanded, onVisibilityChange]);

  useEffect(() => {
    if (!isVisible) setIsExpanded(false);
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

  const toggleHUD = () => setIsExpanded(prev => !prev);

  const handleToolClick = (tool: string) => {
    console.log(`Opening ${tool}`);
  };

  const CortexLogo = () => (
    <img
      src="/icons/cortexlogov1invert.svg"
      alt="Cortex Logo"
      className="h-5 w-5 mr-2"
    />
  );

  const ToolButton = ({ icon: Icon, title, subtitle, onClick }: any) => (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className="glass-hover p-3 rounded-xl text-left transition-all duration-150"
    >
      <Icon className="w-5 h-5 mb-2" />
      <div className="text-xs font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
                onClick={toggleHUD}
                className="glass glass-hover cursor-pointer rounded-2xl p-4 min-w-[200px] max-w-[280px]"
              >
                <div className="flex items-center gap-3">
                  <CortexLogo />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon()}
                      <span className="text-xs font-medium text-muted-foreground truncate">Cortex</span>
                    </div>
                    {statusMessage && (
                      <p className="text-xs text-muted-foreground leading-tight truncate">{statusMessage}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
                className="glass rounded-2xl p-4 w-80"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CortexLogo />
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

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <ToolButton icon={Brain} title="Spatial Nav" subtitle="Navigate workspace" onClick={() => handleToolClick('Spatial Navigator')} />
                  <ToolButton icon={PenTool} title="Inline GPT" subtitle="AI assistance" onClick={() => handleToolClick('Inline GPT')} />
                  <ToolButton icon={StickyNote} title="Session Notes" subtitle="Quick capture" onClick={() => handleToolClick('Session Notes')} />
                  <ToolButton icon={Rocket} title="Smart Launch" subtitle="Quick access" onClick={() => handleToolClick('Smart Launcher')} />
                </div>

                <div className="border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Session Control</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon()}
                      <span className="text-xs text-muted-foreground">{isTracking ? 'Active' : 'Paused'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => handleToolClick(isTracking ? 'Pause' : 'Resume')}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors duration-150"
                    >
                      {isTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {isTracking ? 'Pause' : 'Resume'}
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

                    {!isTracking && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => handleToolClick('Add to Workspace')}
                        className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-medium transition-colors duration-150"
                      >
                        <Plus className="w-3 h-3" />
                        Track
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};