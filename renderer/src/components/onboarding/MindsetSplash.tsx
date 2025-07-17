import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MindsetSplashProps {
  onComplete?: () => void;
}

const MindsetSplash: React.FC<MindsetSplashProps> = ({ onComplete }) => {
  const [currentNoiseIndex, setCurrentNoiseIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
const [typedLogs, setTypedLogs] = useState<string[]>([]);

  const noiseFragments = [
    "37 open tabs.",
     "\"Where was I?\"",
    "Ping from slack.", 
    "You forgot what you were doing. Again.",
    "Where did that doc go?"
   
  ];


  const headlineWords = ["The", "way", "we", "work", "has", "changed."];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNoiseIndex((prev) => (prev + 1) % noiseFragments.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBeginShift = () => {
    if (!onComplete) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/90 text-primary-foreground relative overflow-hidden"
      animate={isTransitioning ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
        <>
          {/* Fog/mist overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: [-100, 100, -100] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
  
          {/* Blur glow blobs */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
  
          {/* Main content */}
          <div className="text-center max-w-4xl mx-auto px-8 relative z-10">
            {/* Animated headline */}
            <div className="mb-8">
              <motion.h1 className="text-6xl md:text-8xl font-bold text-balance leading-tight">
                {headlineWords.map((word, index) => (
                  <motion.span
                    key={index}
                    className="inline-block mr-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.2,
                      ease: "easeOut"
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
            </div>
  
            {/* Mind noise effects */}
            <motion.div 
              className="h-8 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentNoiseIndex}
                  className="text-lg text-primary-foreground/60 font-light italic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  {noiseFragments[currentNoiseIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
  
            {/* Glassmorphic subtext panel */}
            <motion.div
              className="glass rounded-2xl p-6 mb-16 max-w-2xl mx-auto backdrop-blur-sm bg-white/10 border border-white/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <p className="text-xl md:text-2xl text-primary-foreground/90 text-balance leading-relaxed">
                Too many tools. Too much noise. Too little focus.
              </p>
            </motion.div>
  
            {/* Begin shift button */}
            <motion.button
              onClick={handleBeginShift}
              className="group flex items-center gap-2 mx-auto px-8 py-4 rounded-full border border-white/30 shadow-xl transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg font-semibold text-white drop-shadow-sm">Begin Shift</span>
              <motion.span
                className="text-xl text-white drop-shadow-sm"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        </>
    </motion.div>
  );
}
export default MindsetSplash;