import React from 'react';
import { useState } from "react";
import { Clock, Save, Play, Pause, Settings, ChevronUp, ChevronDown } from "lucide-react";


interface SessionLogEntry {
  id: string;
  icon: string;
  message: string;
  timestamp: string;
  type: 'app' | 'idle' | 'focus' | 'system';
}

interface EnhancedSessionSidebarProps {
  isPaused?: boolean;
  onPauseToggle?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
}

const mockLogs: SessionLogEntry[] = [
  { id: '1', icon: '🏁', message: 'Workspace cleared', timestamp: '3:45 PM', type: 'system' },
  { id: '2', icon: '🚀', message: 'Opened Google Chrome', timestamp: '3:47 PM', type: 'app' },
  { id: '3', icon: '🔄', message: 'Focused: Slack (Marketing Channel)', timestamp: '3:52 PM', type: 'focus' },
  { id: '4', icon: '⏸', message: 'Idle detected (inactive 7 min)', timestamp: '4:10 PM', type: 'idle' },
  { id: '5', icon: '📝', message: 'Opened Google Docs: "Q3 Launch Plan"', timestamp: '4:15 PM', type: 'app' },
  { id: '6', icon: '✅', message: 'Session saved', timestamp: '4:20 PM', type: 'system' },
  { id: '7', icon: '💬', message: 'New message in #general', timestamp: '4:22 PM', type: 'focus' },
  { id: '8', icon: '🔍', message: 'Searched for "cortex api"', timestamp: '4:25 PM', type: 'system' },
];

const sessionSummary = "You began your session by opening Chrome and checking your inbox, followed by switching focus to a Google Docs document titled 'Q3 Launch Plan.' Later, you briefly viewed Slack and returned to Chrome to open a new tab. A short period of inactivity was detected before you saved the session. Your recent focus has been split between communication and document editing.";

export function EnhancedSessionSidebar({ 
  isPaused = false, 
  onPauseToggle, 
  onSave, 
  onSettings 
}: EnhancedSessionSidebarProps) {
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const getLogTypeColor = (type: SessionLogEntry['type']) => {
    switch (type) {
      case 'app': return 'text-blue-600';
      case 'focus': return 'text-green-600';
      case 'idle': return 'text-yellow-600';
      case 'system': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-80 bg-sidebar border-l border-border flex flex-col h-full">
      {/* Quick Actions Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Session Control
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onPauseToggle}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isPaused 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            onClick={onSettings}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session Timeline */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Session Logs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setIsLogsExpanded(!isLogsExpanded)}
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">📋</span>
              Session Timeline
            </h3>
            {isLogsExpanded ? 
              <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </div>
          
          {isLogsExpanded && (
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                {mockLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-dashboard-session-item hover:bg-muted/50 transition-colors group"
                  >
                    <div className="text-base leading-none mt-0.5 group-hover:scale-110 transition-transform">
                      {log.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground leading-relaxed">
                        {log.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getLogTypeColor(log.type)} bg-opacity-10`}>
                          {log.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="border-t border-border">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">🧠</span>
              AI Summary
            </h3>
            {isSummaryExpanded ? 
              <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </div>
          
          {isSummaryExpanded && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sessionSummary}
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last updated: 4:25 PM</span>
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}