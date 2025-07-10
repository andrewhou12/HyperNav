
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MindsetSplash from './MindsetSplash';
import WelcomeLoading from './WelcomeLoading';
import PersonalizationPage from './PersonalizationPage';
import SuccessAnimation from './SuccessAnimation';
import AuthenticationPage from './AuthenticationPage';
import IntroSlides from './IntroSlides';
import HotkeyTrainer from './HotkeyTrainer';

export type OnboardingStep = 
  | 'mindset'
  | 'loading'
  | 'auth'
  | 'intro'
  | 'personalization'
  | 'success'
  | 'hotkeys'
  | 'complete';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('mindset');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (currentStep === 'mindset') {
      const timer = setTimeout(() => {
        setCurrentStep('loading');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleStepComplete = (nextStep: OnboardingStep, userData?: any) => {
    if (userData) {
      setUser(userData);
    }
    setCurrentStep(nextStep);
  };

  const handleSkipPersonalization = () => {
    setCurrentStep('success');
  };

  const handleSkipHotkeys = () => {
    setCurrentStep('complete');
    onComplete?.();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'mindset':
        return <MindsetSplash />;
      
      case 'loading':
        return (
          <WelcomeLoading 
            onComplete={() => handleStepComplete('auth')} 
          />
        );
      
      case 'auth':
        return (
          <AuthenticationPage 
            onSuccess={(userData) => handleStepComplete('intro', userData)} 
          />
        );
      
      case 'intro':
        return (
          <IntroSlides 
            onComplete={() => handleStepComplete('personalization')} 
          />
        );
      
      case 'personalization':
        return (
          <PersonalizationPage 
            onComplete={() => handleStepComplete('success')}
            onSkip={handleSkipPersonalization}
          />
        );
      
      case 'success':
        return (
          <SuccessAnimation 
            onComplete={() => handleStepComplete('hotkeys')} 
          />
        );
      
      case 'hotkeys':
        return (
          <HotkeyTrainer 
            onComplete={() => handleStepComplete('complete')}
            onSkip={handleSkipHotkeys}
          />
        );
      
      case 'complete':
        onComplete?.();
        return null;
      
      default:
        return <MindsetSplash />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-muted/20 to-accent/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      {/* Progress indicator */}
      {currentStep !== 'mindset' && currentStep !== 'complete' && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="glass rounded-full px-4 py-2">
            <div className="flex items-center space-x-2">
              {['loading', 'auth', 'intro', 'personalization', 'success', 'hotkeys'].map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    getCurrentStepIndex() > index 
                      ? 'bg-primary' 
                      : getCurrentStepIndex() === index 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {renderCurrentStep()}
      </div>
    </div>
  );

  function getCurrentStepIndex(): number {
    const steps = ['loading', 'auth', 'intro', 'personalization', 'success', 'hotkeys'];
    return steps.indexOf(currentStep);
  }
};

export default OnboardingFlow;