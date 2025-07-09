import { useState } from "react";
import { Chrome, Code, MessageCircle, Folder, Mail, Github, FileText, File, Hash } from "lucide-react";

interface CanvasItem {
  id: string;
  type: 'app' | 'folder' | 'action';
  name: string;
  icon: string;
  position: { x: number; y: number };
  children?: CanvasItem[];
  isActive?: boolean;
  metadata?: {
    tabCount?: number;
    summary?: string;
  };
}

interface WorkspaceCardProps {
  item: CanvasItem;
  isSelected: boolean;
  onClick: () => void;
  onDrag: (itemId: string, newPosition: { x: number; y: number }) => void;
}

const iconMap = {
  chrome: Chrome,
  code: Code,
  'message-circle': MessageCircle,
  folder: Folder,
  mail: Mail,
  github: Github,
  'file-text': FileText,
  file: File,
  hash: Hash,
};

export function WorkspaceCard({ item, isSelected, onClick, onDrag }: WorkspaceCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Folder;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - item.position.x,
      y: e.clientY - item.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onDrag(item.id, newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCardSize = () => {
    if (item.type === 'app') return 'w-24 h-24';
    if (item.type === 'folder') return 'w-20 h-20';
    return 'w-16 h-16'; // action
  };

  const getCardStyle = () => {
    const base = item.type === 'app' 
      ? 'bg-primary text-primary-foreground shadow-lg' 
      : item.type === 'folder'
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-card text-card-foreground border';
    
    return `${base} ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}`;
  };

  return (
    <div className="absolute pointer-events-none">
      {/* Main Card */}
      <div
        className={`
          ${getCardSize()} ${getCardStyle()}
          rounded-xl flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 hover:scale-105 glass glass-hover
          pointer-events-auto select-none
          ${isDragging ? 'scale-110 rotate-3' : ''}
        `}
        style={{
          transform: `translate(${item.position.x}px, ${item.position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={onClick}
      >
        <IconComponent className={item.type === 'app' ? 'w-8 h-8' : 'w-5 h-5'} />
        <span className={`text-xs font-medium mt-1 text-center leading-tight ${item.type === 'action' ? 'text-[10px]' : ''}`}>
          {item.name}
        </span>
        
        {item.metadata?.tabCount && (
          <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {item.metadata.tabCount}
          </div>
        )}
        
        {item.isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Child Items */}
      {item.children?.map((child) => (
        <div
          key={child.id}
          className="absolute pointer-events-auto"
          style={{
            transform: `translate(${child.position.x}px, ${child.position.y}px)`,
          }}
        >
          <div className="w-12 h-8 bg-card border border-border/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-card-hover transition-colors glass">
            <span className="text-[10px] font-medium text-center px-1 truncate">
              {child.name}
            </span>
          </div>
        </div>
      ))}

      {/* Connection Lines */}
      {item.children?.map((child) => (
        <svg
          key={`line-${child.id}`}
          className="absolute pointer-events-none"
          style={{
            left: item.position.x + (item.type === 'app' ? 48 : 40),
            top: item.position.y + (item.type === 'app' ? 48 : 40),
            width: Math.abs(child.position.x - item.position.x),
            height: Math.abs(child.position.y - item.position.y),
          }}
        >
          <line
            x1={0}
            y1={0}
            x2={child.position.x - item.position.x - (item.type === 'app' ? 48 : 40)}
            y2={child.position.y - item.position.y - (item.type === 'app' ? 48 : 40)}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity={0.5}
          />
        </svg>
      ))}
    </div>
  );
}