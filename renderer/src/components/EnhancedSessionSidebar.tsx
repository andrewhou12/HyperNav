import { useState, useEffect, useRef } from "react";
import { Clock, X, Play, Pause, Settings, ChevronUp, ChevronDown, FileText, Activity, CheckCircle, Chrome, MessageCircle, Timer, Search, Eye, EyeOff } from "lucide-react";
import { Notebook } from "./Notebook";

interface SessionLogEntry {
  id: string;
  icon: React.ComponentType<{ className?: string }> | string;
  message: string;
  timestamp: string;
  type: 'app' | 'idle' | 'focus' | 'system';
}

interface EnhancedSessionSidebarProps {
  isPaused?: boolean;
  onPauseToggle?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  isNotebookExpanded?: boolean;
  onNotebookExpand?: () => void;
}

export function EnhancedSessionSidebar({ 
  isPaused = false, 
  onPauseToggle, 
  onSave, 
  onSettings,
  isNotebookExpanded = false,
  onNotebookExpand
}: EnhancedSessionSidebarProps) {
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>([]);
  const [sessionSummary, setSessionSummary] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const sessionLogsRef = useRef<SessionLogEntry[]>([]);
  const summaryTimer = useRef<NodeJS.Timeout | null>(null);

  const normalizeEntry = (item: any, index: number): SessionLogEntry => {
    const ts = new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const id = `${item.timestamp}-${index}`;

    let icon: SessionLogEntry['icon'] = FileText;
    let type: SessionLogEntry['type'] = 'system';
    let message = '';

    switch (item.type) {
      case 'session_started': icon = CheckCircle; message = `Session started: ${new Date(item.timestamp).toLocaleString()}`; break;
      case 'app_opened': icon = Chrome; type = 'app'; message = `Opened ${item.data.appName || item.data.path}`; break;
      case 'tab_focus': icon = Activity; type = 'focus'; message = `Focused: ${item.windowTitle}`; break;
      case 'poll_snapshot': icon = Search; message = `Snapshot: ${item.appName}`; break;
      case 'idle': icon = Timer; type = 'idle'; message = `Idle detected (${item.data?.duration || 'n/a'} min)`; break;
      case 'session_saved': icon = CheckCircle; message = 'Session saved'; break;
      case 'session_paused': icon = Pause; message = 'Session paused'; break;
      case 'session_resumed': icon = Play; message = 'Session resumed'; break;
      case 'visibility_changed': icon = item.data.visible ? Eye : EyeOff; message = item.data.visible ? 'Background apps shown' : 'Background apps hidden'; break;
      default: icon = FileText; message = item.data?.message || item.type; break;
    }

    return { id, icon, message, timestamp: ts, type };
  };

  const generateSummary = async () => {
    try {
      const raw = await window.electron.getSessionData();
      const eventLog = raw.eventLog;
      const summary = await window.electron.summarizeSession(eventLog);
      setSessionSummary(summary);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("❌ Failed to generate session summary:", err);
    }
  };

  useEffect(() => {
    const handler = (entry: any) => {
      const normalized = normalizeEntry(entry, sessionLogsRef.current.length);
      if (sessionLogsRef.current[sessionLogsRef.current.length - 1]?.message !== normalized.message) {
        setSessionLogs(prev => {
          sessionLogsRef.current = [...prev, normalized];
          return sessionLogsRef.current;
        });
      }
    };

    window.electron.getSessionData().then(raw => {
      const initial = raw.eventLog.map(normalizeEntry);
      sessionLogsRef.current = initial;
      setSessionLogs(initial);
      generateSummary();
    });

    window.electron.onSessionLogEntry(handler);
    return () => {
      window.electron.offSessionLogEntry(handler);
    };
  }, []);

  useEffect(() => {
    summaryTimer.current = setInterval(() => {
      generateSummary();
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      if (summaryTimer.current) clearInterval(summaryTimer.current);
    };
  }, []);

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
    <div className="w-full bg-sidebar border-l border-border flex flex-col h-full">
      {/* Session Control */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Session Control
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPauseToggle} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isPaused ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-gray-300'}`}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={onSave} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-gray-300 transition-all">
            <X className="w-4 h-4" />Exit
          </button>
          <button onClick={onSettings} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-gray-300 transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Session Timeline */}
        <div className={`${isLogsExpanded ? 'overflow-y-auto max-h-64' : 'h-auto'} flex flex-col transition-all duration-200`}>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border" onClick={() => setIsLogsExpanded(!isLogsExpanded)}>
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Session Timeline
            </h3>
            {isLogsExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
          {isLogsExpanded && (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 space-y-2">
                {sessionLogs.map((log) => {
                  const IconComponent = typeof log.icon === 'string' ? FileText : log.icon;
                  return (
                    <div key={log.id} className="flex items-center gap-3 py-2.5 px-3 hover:bg-muted/50 transition-colors rounded-md group border-l-2 border-transparent hover:border-primary/30">
                      <div className="text-sm flex-shrink-0">
                        <IconComponent className={`w-4 h-4 ${getLogTypeColor(log.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground truncate">{log.message}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Session Summary */}
        <div className="border-t border-border">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Session Summary
            </h3>
            {isSummaryExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
          {isSummaryExpanded && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">{sessionSummary}</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last updated: {lastUpdated}</span>
                    <button onClick={generateSummary} className="text-primary hover:text-primary/80 transition-colors font-medium">Regenerate</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notebook */}
        <div className="border-t border-border p-4 flex-1">
          <Notebook onExpand={onNotebookExpand} isExpanded={isNotebookExpanded} />
        </div>
      </div>
    </div>
  );
}
