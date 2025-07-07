import React, { useState, useEffect } from 'react';
import { Clock, Save, Play, Pause, Settings, ChevronUp, ChevronDown } from 'lucide-react';

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
  onSettings?: () => void;
}

export function EnhancedSessionSidebar({
  isPaused = false,
  onPauseToggle,
  onSettings
}: EnhancedSessionSidebarProps) {
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>([]);

  // helper to turn your raw sessionData.eventLog items into UI entries
  const normalizeEntry = (item: any, index: number): SessionLogEntry => {
    const ts = new Date(item.timestamp)
      .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const id = `${item.timestamp}-${index}`;
  
    let icon = 'ℹ️';
    let type: SessionLogEntry['type'] = 'system';
    let message = '';
  
    switch (item.type) {
      case 'session_started':
        icon = '🟢'; // or 🎉
        type = 'system';
        message = `Session started: ${new Date(item.timestamp).toLocaleString()}`;
        break;
  
      case 'app_opened':
        icon = '🚀';
        type = 'app';
        message = `Opened ${item.data.appName || item.data.path}`;
        break;
  
      case 'tab_focus':
        icon = '🔄';
        type = 'focus';
        message = `Focused: ${item.windowTitle}`;
        break;
  
      case 'poll_snapshot':
        icon = '📊';
        type = 'system';
        message = `Snapshot: ${item.appName}`;
        break;
  
      case 'idle':
        icon = '⏸';
        type = 'idle';
        message = `Idle detected (${item.data?.duration || 'n/a'} min)`;
        break;
  
      case 'session_saved':
        icon = '✅';
        type = 'system';
        message = 'Session saved';
        break;

      case 'session_paused':
          icon    = '⏸️';
          type    = 'system';
          message = 'Session paused';
          break;
        
      case 'session_resumed':
          icon    = '▶️';
          type    = 'system';
          message = 'Session resumed';
          break;
        
      case 'visibility_changed':
          icon    = item.data.visible ? '👁️' : '🚫👁️';
          type    = 'system';
          message = item.data.visible ? 'Background apps shown' : 'Background apps hidden';
          break;
  
      default:
        icon = 'ℹ️';
        type = 'system';
        message = item.data?.message || item.type;
        break;
    }
  
    return { id, icon, message, timestamp: ts, type };
  };
 
  useEffect(() => {
    // 1) Pull in everything so far
    window.electron.getSessionData().then(raw => {
      setSessionLogs(raw.eventLog.map(normalizeEntry));
    });
  
    // 2) Subscribe to every new entry
    const handler = (entry: any) => {
      setSessionLogs(prev => [
        ...prev,
        normalizeEntry(entry, prev.length)
      ]);
    };
    window.electron.onSessionLogEntry(handler);
  
    // 3) Cleanup on unmount
    return () => {
      window.electron.offSessionLogEntry(handler);
    };
  }, []);  // run only once
  


  const handleSave = async () => {
    await window.electron.saveSession();
    const now = new Date().toISOString();
    const savedEntry = normalizeEntry({ type: 'session_saved', timestamp: now }, sessionLogs.length);
    setSessionLogs(prev => [...prev, savedEntry]);
  };

  const getLogTypeColor = (type: SessionLogEntry['type']) => {
    switch (type) {
      case 'app':   return 'text-blue-600';
      case 'focus': return 'text-green-600';
      case 'idle':  return 'text-yellow-600';
      case 'system':return 'text-purple-600';
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
            onClick={handleSave}
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
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsLogsExpanded(!isLogsExpanded)}
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">📋</span>
            Session Timeline
          </h3>
          {isLogsExpanded 
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> 
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
        {isLogsExpanded && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {sessionLogs.map(log => (
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
                    <span
                      className={`
                        text-xs px-1.5 py-0.5 rounded 
                        ${getLogTypeColor(log.type)} bg-opacity-10
                      `}
                    >
                      {log.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
            {isSummaryExpanded 
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> 
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </div>
          {isSummaryExpanded && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {/* you can also fetch summary via IPC if dynamic */}
                  You began your session by opening Chrome and checking your inbox…
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last updated: {/* optionally dynamic */}</span>
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
