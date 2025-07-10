
import React from 'react';

const MindsetSplash: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/90 text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="text-center max-w-4xl mx-auto px-8 relative z-10 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-balance leading-tight">
          The way we work has changed.
        </h1>
        
        <p className="text-xl md:text-2xl text-primary-foreground/80 text-balance max-w-2xl mx-auto leading-relaxed">
          Too many tools. Too much noise. Too little focus.
        </p>
        
        <div className="mt-16 flex justify-center">
          <div className="w-1 h-16 bg-gradient-to-b from-primary-foreground/60 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default MindsetSplash;
