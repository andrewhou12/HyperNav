
import React, { useEffect, useState } from 'react';

interface WelcomeLoadingProps {
  onComplete: () => void;
}

const WelcomeLoading: React.FC<WelcomeLoadingProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="text-center animate-fade-in">
        {/* Cortex Logo */}
        <div className="mb-12 relative">
          <div className="w-24 h-24 mx-auto glass rounded-3xl flex items-center justify-center animate-glow p-4">
            <img 
              src="/lovable-uploads/217235f9-296e-4613-9f8e-bed9993048df.png" 
              alt="Cortex Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Cortex
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12">
          Preparing your workspace...
        </p>
        
        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="glass rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {progress < 30 && "Initializing workspace..."}
            {progress >= 30 && progress < 60 && "Loading integrations..."}
            {progress >= 60 && progress < 90 && "Setting up environment..."}
            {progress >= 90 && "Almost ready..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeLoading;
