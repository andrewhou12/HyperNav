
import React, { useState } from 'react';
import { Command, Search, Zap, CheckCircle, X, ArrowRight, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotkeyTrainerProps {
  onComplete: () => void;
  onSkip: () => void;
}

const hotkeys = [
  {
    id: 'navigator',
    key: 'Option + Tab',
    icon: Command,
    title: 'Spatial Navigator',
    description: 'Navigate between apps and windows visually',
    demo: 'Try pressing Option + Tab to see all your open apps'
  },
  {
    id: 'ai',
    key: 'Option + Space',
    icon: Zap,
    title: 'Cortex Intelligence',
    description: 'Inline, fully context-aware AI assistance anywhere',
    demo: 'Use Option + Space to get AI help inline with full context'
  },
  {
    id: 'launcher',
    key: 'Option + L',
    icon: Search,
    title: 'Smart Launcher',
    description: 'Launch apps, search files, and run commands',
    demo: 'Press Option + L to open the universal launcher'
  },
  {
    id: 'utilities',
    key: 'Option + Shift',
    icon: Wrench,
    title: 'Workspace Utilities',
    description: 'Quick access to timers, calculator, clipboard, and notes',
    demo: 'Use Option + Shift for instant access to workspace tools'
  }
];

const HotkeyTrainer: React.FC<HotkeyTrainerProps> = ({ onComplete, onSkip }) => {
  const [currentHotkey, setCurrentHotkey] = useState(0);
  const [completedHotkeys, setCompletedHotkeys] = useState<string[]>([]);

  const handleNext = () => {
    const current = hotkeys[currentHotkey];
    if (!completedHotkeys.includes(current.id)) {
      setCompletedHotkeys(prev => [...prev, current.id]);
    }

    if (currentHotkey < hotkeys.length - 1) {
      setCurrentHotkey(currentHotkey + 1);
    } else {
      onComplete();
    }
  };

  const handlePractice = () => {
    // Simulate practicing the hotkey
    const current = hotkeys[currentHotkey];
    setCompletedHotkeys(prev => [...prev, current.id]);
  };

  const current = hotkeys[currentHotkey];
  const isCompleted = completedHotkeys.includes(current.id);

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-3xl mx-auto animate-slide-up">
        <div className="glass rounded-3xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">⌨️</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Master the Essential Shortcuts
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn these {hotkeys.length} shortcuts to unlock Cortex's full potential
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center space-x-4">
            {hotkeys.map((hotkey, index) => (
              <div
                key={hotkey.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentHotkey
                    ? 'bg-primary scale-125'
                    : completedHotkeys.includes(hotkey.id)
                      ? 'bg-green-500'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Current Hotkey */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <current.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 glass rounded-xl px-6 py-3">
                  <kbd className="px-3 py-2 bg-muted rounded-lg text-sm font-mono font-semibold">
                    {current.key}
                  </kbd>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {current.title}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {current.description}
              </p>
              <div className="glass rounded-xl p-4 max-w-lg mx-auto">
                <p className="text-sm text-muted-foreground">
                  <strong>Try it:</strong> {current.demo}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="glass-hover"
            >
              <X className="w-4 h-4 mr-2" />
              Skip tutorial
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handlePractice}
                disabled={isCompleted}
                variant="outline"
                size="lg"
                className="glass-hover"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Practiced
                  </>
                ) : (
                  'Practice Now'
                )}
              </Button>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentHotkey === hotkeys.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotkeyTrainer;
