import React from 'react';
import { Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSyncedNote } from "@/hooks/useSyncedNote";

interface QuickNotesProps {
  isExpanded: boolean;
  onToggleExpand: (expand: boolean) => void;
}

export const QuickNotes: React.FC<QuickNotesProps> = ({ isExpanded, onToggleExpand }) => {
  const { note, setNote, clearNote: handleClear } = useSyncedNote();

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
            onClick={() => onToggleExpand(!isExpanded)}
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
        className={`w-full p-3 rounded-xl border border-border bg-card/50 resize-none focus:outline-none transition-all flex-1 ${
          isExpanded ? 'min-h-[400px]' : 'min-h-[250px]'
        }`}
      />

      <div className="text-xs text-muted-foreground">
        Auto-saved • {note.length} characters
      </div>
    </motion.div>
  );
};
