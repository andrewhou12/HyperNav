import { useState, useRef, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { WorkspaceCard } from "./WorkspaceCard";
import { Minimap } from "./Minimap";
import { ZoomControls } from "./ZoomControls";

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

const mockCanvasItems: CanvasItem[] = [
  {
    id: 'chrome',
    type: 'app',
    name: 'Google Chrome',
    icon: 'chrome',
    position: { x: 100, y: 100 },
    isActive: true,
    metadata: { tabCount: 8 },
    children: [
      { id: 'gmail', type: 'action', name: 'Gmail', icon: 'mail', position: { x: 120, y: 160 } },
      { id: 'github', type: 'action', name: 'GitHub', icon: 'github', position: { x: 180, y: 160 } },
      { id: 'docs', type: 'action', name: 'Google Docs', icon: 'file-text', position: { x: 240, y: 160 } },
    ]
  },
  {
    id: 'vscode',
    type: 'app',
    name: 'VS Code',
    icon: 'code',
    position: { x: 400, y: 150 },
    metadata: { tabCount: 12 },
    children: [
      { id: 'app-tsx', type: 'action', name: 'App.tsx', icon: 'file', position: { x: 420, y: 210 } },
      { id: 'index-css', type: 'action', name: 'index.css', icon: 'file', position: { x: 480, y: 210 } },
      { id: 'component-tsx', type: 'action', name: 'Component.tsx', icon: 'file', position: { x: 540, y: 210 } },
    ]
  },
  {
    id: 'slack',
    type: 'app',
    name: 'Slack',
    icon: 'message-circle',
    position: { x: 200, y: 350 },
    children: [
      { id: 'general', type: 'action', name: '#general', icon: 'hash', position: { x: 220, y: 410 } },
      { id: 'dev-team', type: 'action', name: '#dev-team', icon: 'hash', position: { x: 280, y: 410 } },
    ]
  },
  {
    id: 'projects',
    type: 'folder',
    name: 'Projects',
    icon: 'folder',
    position: { x: 600, y: 100 },
    children: [
      { id: 'project-a', type: 'action', name: 'Project A', icon: 'folder', position: { x: 620, y: 160 } },
      { id: 'project-b', type: 'action', name: 'Project B', icon: 'folder', position: { x: 680, y: 160 } },
    ]
  }
];

export function InfiniteCanvas() {
  const [items, setItems] = useState<CanvasItem[]>(mockCanvasItems);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const transformRef = useRef<any>(null);

  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItem(itemId);
    console.log('Item clicked:', itemId);
  }, []);

  const handleItemDrag = useCallback((itemId: string, newPosition: { x: number; y: number }) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, position: newPosition }
        : item
    ));
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, []);

  const handleZoomToItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && transformRef.current) {
      transformRef.current.setTransform(
        window.innerWidth / 2 - item.position.x - 100,
        window.innerHeight / 2 - item.position.y - 100,
        1.5,
        200
      );
    }
  }, [items]);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <div className="w-full h-full">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.1}
          maxScale={3}
          limitToBounds={false}
          centerOnInit={false}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: false, mode: "zoomIn", step: 0.3 }}
          panning={{ velocityDisabled: true }}
        >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full"
        >
          <div className="relative w-[2000px] h-[2000px] bg-gradient-to-br from-background via-muted/20 to-background">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Canvas Items */}
            {items.map((item) => (
              <WorkspaceCard
                key={item.id}
                item={item}
                isSelected={selectedItem === item.id}
                onClick={() => handleItemClick(item.id)}
                onDrag={handleItemDrag}
              />
            ))}
          </div>
        </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Controls */}
      <ZoomControls 
        onZoomIn={() => transformRef.current?.zoomIn(0.3)}
        onZoomOut={() => transformRef.current?.zoomOut(0.3)}
        onZoomToFit={handleZoomToFit}
      />

      {/* Minimap */}
      <Minimap 
        items={items}
        onItemClick={handleZoomToItem}
        selectedItem={selectedItem}
      />
    </div>
  );
}