import { useState } from "react";
import { Expand, Trash2, StickyNote, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";

interface NotebookProps {
  onExpand?: () => void;
  isExpanded?: boolean;
}

export function Notebook({ onExpand, isExpanded = false }: NotebookProps) {
  const [content, setContent] = useState("");

  const handleClear = () => {
    setContent("");
  };

  return (
    <div 
      className={`
        glass border border-border/50 rounded-xl transition-all duration-300
        ${isExpanded 
          ? 'fixed inset-4 z-50 flex flex-col' 
          : 'h-64 flex flex-col'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Notes</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            title="Clear notes"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Expand className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add your notes here..."
          className="w-full h-full resize-none bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground custom-scrollbar"
        />
      </div>

      {/* Expanded overlay backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10"
          onClick={onExpand}
        />
      )}
    </div>
  );
}