
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Timer, Clock, Bell, Plus } from 'lucide-react';

type TimerMode = 'timer' | 'stopwatch' | 'alarm';

export const TimerSuite: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('timer');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputTime, setInputTime] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [alarmTime, setAlarmTime] = useState({ hours: 12, minutes: 0 });
  const [laps, setLaps] = useState<number[]>([]);

  // Initialize timer with input time when switching to timer mode
  useEffect(() => {
    if (mode === 'timer') {
      setTime(inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds);
    } else if (mode === 'stopwatch') {
      setTime(0);
      setLaps([]);
    }
    setIsRunning(false);
  }, [mode, inputTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'timer') {
          setTime(prevTime => {
            if (prevTime <= 1) {
              setIsRunning(false);
              console.log('Timer finished!');
              return 0;
            }
            return prevTime - 1;
          });
        } else if (mode === 'stopwatch') {
          setTime(prevTime => prevTime + 1);
        } else if (mode === 'alarm') {
          const now = new Date();
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          
          if (currentHours === alarmTime.hours && currentMinutes === alarmTime.minutes) {
            setIsRunning(false);
            console.log('Alarm triggered!');
            alert('Alarm! Time is up!');
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, alarmTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    resetTimer();
  };

  const handleLap = () => {
    if (mode === 'stopwatch') {
      setLaps(prev => [...prev, time]);
    }
  };

  const resetTimer = () => {
    switch (mode) {
      case 'timer':
        setTime(inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds);
        break;
      case 'stopwatch':
        setTime(0);
        setLaps([]);
        break;
      case 'alarm':
        setTime(0);
        break;
    }
  };

  const modes = [
    { id: 'timer', name: 'Timer', icon: Timer },
    { id: 'stopwatch', name: 'Stopwatch', icon: Clock },
    { id: 'alarm', name: 'Alarm', icon: Bell },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      <h3 className="font-medium text-foreground">Timer Suite</h3>

      {/* Mode Selection */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as TimerMode);
                setIsRunning(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                mode === m.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Timer Display */}
      <div className="bg-card/50 rounded-xl p-4 border border-border text-center">
        {mode === 'alarm' ? (
          <div>
            <div className="text-2xl font-mono font-bold text-foreground mb-1">
              {alarmTime.hours.toString().padStart(2, '0')}:{alarmTime.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">
              Current: {formatCurrentTime()}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-3xl font-mono font-bold text-foreground mb-1">
              {formatTime(time)}
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {mode}
            </div>
          </div>
        )}
      </div>

      {/* Time Input for Timer */}
      {mode === 'timer' && !isRunning && (
        <div className="flex gap-2 items-center justify-center">
          <input
            type="number"
            value={inputTime.hours}
            onChange={(e) => setInputTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
            className="w-16 p-2 rounded-lg border border-border bg-card/50 text-center text-sm"
            placeholder="HH"
            min="0"
            max="23"
          />
          <span className="text-sm">:</span>
          <input
            type="number"
            value={inputTime.minutes}
            onChange={(e) => setInputTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
            className="w-16 p-2 rounded-lg border border-border bg-card/50 text-center text-sm"
            placeholder="MM"
            min="0"
            max="59"
          />
          <span className="text-sm">:</span>
          <input
            type="number"
            value={inputTime.seconds}
            onChange={(e) => setInputTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
            className="w-16 p-2 rounded-lg border border-border bg-card/50 text-center text-sm"
            placeholder="SS"
            min="0"
            max="59"
          />
        </div>
      )}

      {/* Alarm Time Input */}
      {mode === 'alarm' && (
        <div className="flex gap-2 items-center justify-center">
          <input
            type="number"
            value={alarmTime.hours}
            onChange={(e) => setAlarmTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
            className="w-16 p-2 rounded-lg border border-border bg-card/50 text-center text-sm"
            placeholder="HH"
            min="0"
            max="23"
          />
          <span className="text-sm">:</span>
          <input
            type="number"
            value={alarmTime.minutes}
            onChange={(e) => setAlarmTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
            className="w-16 p-2 rounded-lg border border-border bg-card/50 text-center text-sm"
            placeholder="MM"
            min="0"
            max="59"
          />
        </div>
      )}

      {/* Stopwatch Laps */}
      {mode === 'stopwatch' && laps.length > 0 && (
        <div className="bg-card/50 rounded-xl p-3 border border-border max-h-24 overflow-y-auto custom-scrollbar">
          <div className="text-xs text-muted-foreground mb-2">Laps</div>
          {laps.map((lap, index) => (
            <div key={index} className="text-sm font-mono">
              Lap {index + 1}: {formatTime(lap)}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center mt-auto">
        <button
          onClick={isRunning ? handlePause : handleStart}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={handleStop}
          className="flex items-center gap-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors text-sm"
        >
          <Square className="w-3 h-3" />
          Stop
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center gap-1 px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-sm"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        {mode === 'stopwatch' && (
          <button
            onClick={handleLap}
            className="flex items-center gap-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors text-sm"
          >
            <Plus className="w-3 h-3" />
            Lap
          </button>
        )}
      </div>
    </motion.div>
  );
};