import { useState } from "react";
import { Chrome, Slack, Folder, MoreHorizontal, X, GripVertical } from "lucide-react";

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
  isActive?: boolean;
  onTabClick?: (tabId: string) => void;
  onCloseApp?: () => void;
  onCloseTab?: (tabId: string) => void;
  onDragStart?: () => void;
  customIcon?: string; // ✅ added
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
  isActive = false,
  onTabClick,
  onCloseApp,
  onCloseTab,
  onDragStart,
  customIcon // ✅ added
}: AppStackProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const IconComponent = iconMap[icon];
  const activeTabs = tabs.filter(tab => tab.isActive).length;

  return (
    <div 
      className={`
        group rounded-xl border transition-all duration-200 relative w-full aspect-square flex flex-col
        ${isActive 
          ? 'bg-background border-2 border-primary shadow-dashboard' 
          : 'bg-dashboard-stack hover:bg-dashboard-stack-hover border-border hover:shadow-dashboard-hover'
        }
      `}
      draggable
      onDragStart={onDragStart}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 cursor-grab">
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCloseApp?.();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </button>

      {/* Stack Header */}
      <div className="flex flex-col items-center gap-2 p-3">
        <div className={`
          p-2 rounded-lg transition-colors
          ${isActive ? 'bg-card border border-primary' : 'bg-card group-hover:bg-muted/50'}
        `}>
          {customIcon ? (
            <img src={customIcon} alt="" className="w-5 h-5 rounded-sm object-cover" />
          ) : (
            <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
        </div>
        
        <div className="text-center min-w-0">
          <h3 className="font-medium text-card-foreground truncate text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {tabs.length} {tabs.length === 1 ? 'item' : 'items'}
          </p>
          {activeTabs > 0 && (
            <p className="text-xs text-primary">
              {activeTabs} active
            </p>
          )}
        </div>

        {isActive && (
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>

      {/* Always Visible Tabs */}
      {tabs.length > 0 && (
        <div className="flex-1 px-4 pb-4 overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`
                  relative group/tab px-2 py-1 rounded text-xs truncate max-w-32 transition-colors cursor-pointer
                  ${tab.isActive 
                    ? 'bg-background text-foreground border-2 border-primary' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClick?.(tab.id);
                }}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {tab.title}
                {hoveredTab === tab.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab?.(tab.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive/20 hover:bg-destructive/40 rounded-full flex items-center justify-center"
                  >
                    <X className="w-2 h-2 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
