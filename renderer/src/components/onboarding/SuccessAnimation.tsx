
import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessAnimationProps {
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ onComplete }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowConfetti(true), 300);
    const timer2 = setTimeout(() => setShowContent(true), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-accent/10" />
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div className={`w-full max-w-2xl mx-auto text-center transition-all duration-1000 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
        <div className="glass rounded-3xl p-12 space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-glow">
                <CheckCircle className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Workspace ready!
            </h1>
            <p className="text-xl text-muted-foreground">
              You're in control.
            </p>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Cortex is now configured and ready to transform your workflow. 
              Let's show you the essential shortcuts to get started.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={onComplete}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Learn the shortcuts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Tip: Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Option + Tab</kbd> to begin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
