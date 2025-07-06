import React from 'react';

import { useState } from "react";
import { Chrome, Slack, ChevronDown, ChevronRight, Folder, MoreHorizontal } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  url?: string;
  isActive?: boolean;
}

interface AppStackProps {
  name: string;
  icon: "chrome" | "slack" | "vscode" | "folder";
  tabs: Tab[];
  isExpanded?: boolean;
  isActive?: boolean;
  onToggleExpanded?: () => void;
  onTabClick?: (tabId: string) => void;
}

const iconMap = {
  chrome: Chrome,
  slack: Slack,
  folder: Folder,
  vscode: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352z"/>
    </svg>
  )
};

export function AppStack({ 
  name, 
  icon, 
  tabs, 
  isExpanded = false, 
  isActive = false,
  onToggleExpanded,
  onTabClick 
}: AppStackProps) {
  const IconComponent = iconMap[icon];
  const activeTabs = tabs.filter(tab => tab.isActive).length;

  return (
    <div className={`
      group rounded-xl border transition-all duration-200 
      ${isActive 
        ? 'bg-primary/5 border-primary/20 shadow-dashboard' 
        : 'bg-dashboard-stack hover:bg-dashboard-stack-hover  hover:shadow-dashboard-hover'
      }
    `}>
      {/* Stack Header */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className={`
          p-2 rounded-lg transition-colors
          ${isActive ? 'bg-primary/10' : 'bg-card group-hover:bg-primary/5'}
        `}>
          <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-card-foreground truncate">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {tabs.length} {tabs.length === 1 ? 'item' : 'items'}
            {activeTabs > 0 && ` • ${activeTabs} active`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {isExpanded ? 
            <ChevronDown className="w-4 h-4 text-muted-foreground" /> : 
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </div>

      {/* Expanded Tabs */}
      {isExpanded && (
        <div className="border-t  bg-card/50">
          <div className="max-h-48 overflow-y-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`
                  flex items-center gap-3 px-4 py-2 hover:bg-muted/50 cursor-pointer transition-colors
                  ${tab.isActive ? 'bg-primary/5 border-r-2 border-primary' : ''}
                `}
                onClick={() => onTabClick?.(tab.id)}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${tab.isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                <span className={`text-sm truncate ${tab.isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {tab.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}