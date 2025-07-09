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
  
  interface MinimapProps {
    items: CanvasItem[];
    onItemClick: (itemId: string) => void;
    selectedItem: string | null;
  }
  
  export function Minimap({ items, onItemClick, selectedItem }: MinimapProps) {
    const SCALE = 0.1; // Scale down factor for minimap
  
    return (
      <div className="absolute bottom-4 right-4 w-48 h-32 glass border border-border/50 rounded-lg overflow-hidden">
        <div className="relative w-full h-full bg-background/50">
          {/* Minimap title */}
          <div className="absolute top-1 left-2 text-xs font-medium text-muted-foreground">
            Workspace Map
          </div>
          
          {/* Minimap items */}
          <div className="relative w-full h-full">
            {items.map((item) => (
              <div
                key={item.id}
                className={`
                  absolute w-2 h-2 rounded cursor-pointer transition-all
                  ${item.type === 'app' ? 'bg-primary' : item.type === 'folder' ? 'bg-secondary' : 'bg-muted'}
                  ${selectedItem === item.id ? 'ring-1 ring-accent scale-150' : 'hover:scale-125'}
                `}
                style={{
                  left: item.position.x * SCALE,
                  top: item.position.y * SCALE + 16, // Offset for title
                }}
                onClick={() => onItemClick(item.id)}
                title={item.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }