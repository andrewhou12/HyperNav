import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuickNotes: React.FC = () => {
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedNote = localStorage.getItem('cortex-quick-note');
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cortex-quick-note', note);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [note]);

  const handleClear = () => {
    setNote('');
    localStorage.removeItem('cortex-quick-note');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  {/* expand button is broken right now, need to fix */}

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 h-full flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Notes</h3>
        <div className="flex gap-1">
          <button
            onClick={handleClear}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            title="Clear notes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleExpanded}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot something down…"
        className={`w-full p-3 rounded-xl border border-border bg-card/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all flex-1 ${
          isExpanded ? 'min-h-[320px]' : 'min-h-[250px]'
        }`}
      />

      <div className="text-xs text-muted-foreground">
        Auto-saved • {note.length} characters
      </div>
    </motion.div>
  );
};
