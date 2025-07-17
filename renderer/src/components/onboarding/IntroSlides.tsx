
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Focus, Zap, Command, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Focus,
    title: 'Next Level Focus',
    description: 'No more context switching. Keep your workspace and distraction and clutter-free.',
    color: 'from-primary to-primary/70'
  },
  {
    icon: Zap,
    title: 'Work Smarter',
    description: 'Use AI, quick navigation, and built-in tools—all in one place.',
    color: 'from-accent to-accent/70'
  },
  {
    icon: Command,
    title: 'Total Control',
    description: 'Launch, switch, summarize, and stay in flow—Cortex is always at your fingertips.',
    color: 'from-primary to-accent'
  },

  {
    icon: Brain,
    title: 'Second Brain',
    description: 'Cortex Intelligence remembers, anticipates, and adapts—powering the engine of your supercharged workspace.',
    color: 'from-accent to-accent/70'
  }
];

const IntroSlides: React.FC<IntroSlidesProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
      
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-12 text-center animate-scale-in">
          {/* Slide Content */}
          <div className="space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center glass-hover transform transition-all duration-500`}>
                {React.createElement(slides[currentSlide].icon, {
                  className: "w-12 h-12 text-primary-foreground",
                  strokeWidth: 1.5
                })}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-foreground">
                {slides[currentSlide].title}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 space-y-8">
            {/* Slide Indicators */}
            <div className="flex justify-center space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between max-w-md mx-auto">
              <Button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                variant="outline"
                size="lg"
                className="glass-hover"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={nextSlide}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSlides;
