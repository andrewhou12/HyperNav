import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Clock,
  ClipboardList,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { QuickNotes } from './utilities/QuickNotes';
import { CalculatorTool } from './utilities/CalculatorTool';
import { TimerSuite } from './utilities/TimerSuite';
import { ClipboardManager } from './utilities/ClipboardManager';

interface CortexUtilitiesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CortexUtilities: React.FC<CortexUtilitiesProps> = ({ isOpen, onClose }) => {
  const [selectedTool, setSelectedTool] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const utilRef = useRef<HTMLDivElement>(null);

  const handleExpand = (shouldExpand: boolean) => {
    setIsExpanded(shouldExpand);
    window.electron.resizeOverlayWindow(
      shouldExpand ? 1000 : 550,
      shouldExpand ? 1000 : 650
    );
  };

  const tools = [
    {
      id: 'notes',
      name: 'Notes',
      icon: StickyNote,
      component: () => (
        <QuickNotes
          isExpanded={isExpanded}
          onToggleExpand={handleExpand}
        />
      ),
    },
    { id: 'calculator', name: 'Calculator', icon: Calculator, component: CalculatorTool },
    { id: 'timer', name: 'Timer', icon: Clock, component: TimerSuite },
    { id: 'clipboard', name: 'Clipboard', icon: ClipboardList, component: ClipboardManager },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && !event.repeat) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const newIndex = selectedTool > 0 ? selectedTool - 1 : tools.length - 1;
          setSelectedTool(newIndex);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          const newIndex = selectedTool < tools.length - 1 ? selectedTool + 1 : 0;
          setSelectedTool(newIndex);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (utilRef.current && !utilRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, selectedTool, onClose]);

  const CurrentTool = tools[selectedTool].component;

  if (!isOpen) return null;

  return (
    <div
  className="fixed inset-0 z-50 flex items-center justify-center"
  ref={utilRef}
>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`glass rounded-2xl p-6 shadow-2xl border border-border transition-all ${
          isExpanded ? 'w-[1000px] h-[1000px]' : 'min-w-[400px] max-w-[500px] h-[650px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="./icons/cortexlogov3.svg"
              alt="Cortex"
              className="w-6 h-6"
            />
            <h2 className="text-lg font-semibold text-foreground">
              Cortex Utilities
            </h2>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Navigation */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-xl">
          <button
            onClick={() => {
              const newIndex = selectedTool > 0 ? selectedTool - 1 : tools.length - 1;
              setSelectedTool(newIndex);
            }}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex gap-1">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === index;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(index)}
                  className={`flex-1 flex items-center justify-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              const newIndex = selectedTool < tools.length - 1 ? selectedTool + 1 : 0;
              setSelectedTool(newIndex);
            }}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Content */}
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          {typeof CurrentTool === 'function' ? <CurrentTool /> : <></>}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground text-center">
          Use ← → arrows to navigate • Esc to close • ⌥⇧ to toggle
        </div>
      </motion.div>
    </div>
  );
};
