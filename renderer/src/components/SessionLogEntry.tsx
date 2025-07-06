import React from 'react';
interface SessionLogEntryProps {
  icon: string;
  message: string;
  timestamp: string;
}

export function SessionLogEntry({ icon, message, timestamp }: SessionLogEntryProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-dashboard-session-item hover:bg-muted/50 transition-colors group">
      <div className="text-lg leading-none mt-0.5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-card-foreground leading-relaxed">
          {message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timestamp}
        </p>
      </div>
    </div>
  );
}