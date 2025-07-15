
import { useState } from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-8">
        <div className="glass rounded-3xl p-12 space-y-6">
          <div className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center p-2">
            <img 
              src="/icons/cortexlogov1invert.svg"
              alt="Cortex Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Cortex
            </h1>
            <p className="text-xl text-muted-foreground">
              Your smart workspace layer is ready. Press Option + Tab to begin.
            </p>
          </div>

          <Button
            onClick={() => setShowOnboarding(true)}
            variant="outline"
            size="lg"
            className="glass-hover"
          >
            Replay Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
};

