import { Chrome, Slack } from "lucide-react";

interface AppCardProps {
  name: string;
  icon: "chrome" | "slack" | "vscode";
  tabs: string[];
  isActive?: boolean;
}

const iconMap = {
  chrome: Chrome,
  slack: Slack,
  vscode: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352z"/>
    </svg>
  )
};

export function AppCard({ name, icon, tabs, isActive = false }: AppCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={`
      group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
      ${isActive 
        ? 'bg-primary/5 border-primary/20 shadow-dashboard' 
        : 'bg-card hover:bg-card-hover border-border hover:shadow-dashboard-hover'
      }
    `}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          p-2 rounded-lg transition-colors
          ${isActive ? 'bg-primary/10' : 'bg-dashboard-app-icon group-hover:bg-primary/5'}
        `}>
          <IconComponent className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <h3 className="font-medium text-card-foreground">{name}</h3>
      </div>

      <div className="space-y-1.5">
        {tabs.map((tab, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span className="truncate">{tab}</span>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
}