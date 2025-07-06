import React from 'react';
interface SummarySectionProps {
  summary: string;
}

export function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
        <span className="text-base">🧠</span>
        Summary
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {summary}
      </p>
    </div>
  );
}