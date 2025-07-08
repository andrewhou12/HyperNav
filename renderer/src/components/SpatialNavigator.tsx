import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Command, Folder, Monitor, FileText, Settings, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CortexLogo } from "./CortexLogo";

interface NavigatorItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  type: "app" | "tab" | "folder" | "action";
  parent?: string;
  children?: NavigatorItem[];
  shortcut?: string;
  gridPosition?: { x: number; y: number };
}

interface QuickNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced data with spatial positioning
const navigatorData: NavigatorItem[] = [
  {
    id: "chrome",
    title: "Chrome",
    subtitle: "8 tabs open",
    icon: Monitor,
    type: "app",
    gridPosition: { x: 0, y: 0 },
    children: [
      { id: "tab1", title: "React Docs", subtitle: "reactjs.org", icon: FileText, type: "tab", parent: "chrome" },
      { id: "tab2", title: "GitHub", subtitle: "github.com/cortex", icon: FileText, type: "tab", parent: "chrome" },
      { id: "tab3", title: "Figma", subtitle: "figma.com", icon: FileText, type: "tab", parent: "chrome" },
    ]
  },
  {
    id: "vscode",
    title: "VS Code",
    subtitle: "5 files open",
    icon: Monitor,
    type: "app",
    gridPosition: { x: 1, y: 0 },
    children: [
      { id: "file1", title: "Navigator.tsx", subtitle: "src/components/", icon: FileText, type: "tab", parent: "vscode" },
      { id: "file2", title: "index.css", subtitle: "src/", icon: FileText, type: "tab", parent: "vscode" },
      { id: "file3", title: "App.tsx", subtitle: "src/", icon: FileText, type: "tab", parent: "vscode" },
    ]
  },
  {
    id: "notion",
    title: "Notion",
    subtitle: "Workspace",
    icon: Monitor,
    type: "app",
    gridPosition: { x: 2, y: 0 },
    children: [
      { id: "page1", title: "Roadmap", subtitle: "Planning", icon: FileText, type: "tab", parent: "notion" },
      { id: "page2", title: "Notes", subtitle: "Team", icon: FileText, type: "tab", parent: "notion" },
    ]
  },
  {
    id: "project-stack",
    title: "Current Project",
    subtitle: "Chrome + VS Code",
    icon: Folder,
    type: "folder",
    gridPosition: { x: 0, y: 1 },
    children: [
      { id: "chrome-ref", title: "Chrome", subtitle: "8 tabs", icon: Monitor, type: "app" },
      { id: "vscode-ref", title: "VS Code", subtitle: "5 files", icon: Monitor, type: "app" },
    ]
  },
  {
    id: "design-stack",
    title: "Design System",
    subtitle: "Figma + Docs",
    icon: Folder,
    type: "folder",
    gridPosition: { x: 1, y: 1 },
  },
  {
    id: "action-settings",
    title: "Settings",
    subtitle: "⌘,",
    icon: Settings,
    type: "action",
    gridPosition: { x: 2, y: 1 },
    shortcut: "⌘,"
  },
  {
    id: "action-pause",
    title: "Pause Session",
    subtitle: "Take a break",
    icon: Zap,
    type: "action",
    gridPosition: { x: 0, y: 2 }
  }
];

const GRID_COLS = 3;
const GRID_ROWS = 3;

export function SpatialNavigator({ isOpen, onClose }: QuickNavigatorProps) {
  const [query, setQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 });
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
  const [internalPosition, setInternalPosition] = useState({ x: 0, y: 0 });
  const [filteredItems, setFilteredItems] = useState<NavigatorItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filterItems = useCallback(() => {
    if (query === "") {
      setFilteredItems(navigatorData);
      return;
    }

    const filtered = navigatorData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.subtitle?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [query]);

  useEffect(() => {
    filterItems();
    setSelectedPosition({ x: 0, y: 0 });
  }, [filterItems]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get item at specific grid position
  const getItemAtPosition = (x: number, y: number) => {
    return filteredItems.find(item => 
      item.gridPosition?.x === x && item.gridPosition?.y === y
    ) || null;
  };

  // Get child item within expanded tile
  const getChildAtInternalPosition = (parentItem: NavigatorItem, x: number, y: number) => {
    if (!parentItem.children) return null;
    const childIndex = y * 2 + x; // 2x2 internal grid
    return parentItem.children[childIndex] || null;
  };

  // Get valid main grid positions
  const getValidPositions = () => {
    return filteredItems.map(item => item.gridPosition).filter(pos => pos) as { x: number; y: number }[];
  };

  // Get valid internal positions for expanded tile
  const getValidInternalPositions = (item: NavigatorItem) => {
    if (!item.children) return [];
    const positions: { x: number; y: number }[] = [];
    item.children.forEach((_, index) => {
      const x = index % 2;
      const y = Math.floor(index / 2);
      positions.push({ x, y });
    });
    return positions;
  };

  // Handle spatial navigation with in-tile expansion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // If we're inside an expanded tile, handle internal navigation
      if (expandedTile) {
        const expandedItem = filteredItems.find(item => item.id === expandedTile);
        if (expandedItem) {
          const validInternalPositions = getValidInternalPositions(expandedItem);
          
          switch (e.key) {
            case "ArrowRight":
              e.preventDefault();
              const nextInternalRightIndex = validInternalPositions.findIndex(
                pos => pos.y === internalPosition.y && pos.x > internalPosition.x
              );
              if (nextInternalRightIndex !== -1) {
                setInternalPosition(validInternalPositions[nextInternalRightIndex]);
              } else {
                // Hit right edge, try to move to next parent tile
                const validPositions = getValidPositions();
                const nextParentRightIndex = validPositions.findIndex(
                  pos => pos.y === selectedPosition.y && pos.x > selectedPosition.x
                );
                if (nextParentRightIndex !== -1) {
                  setExpandedTile(null);
                  setInternalPosition({ x: 0, y: 0 });
                  setSelectedPosition(validPositions[nextParentRightIndex]);
                }
              }
              break;
              
            case "ArrowLeft":
              e.preventDefault();
              const nextInternalLeftIndex = [...validInternalPositions]
                .reverse()
                .findIndex(pos => pos.y === internalPosition.y && pos.x < internalPosition.x);
              if (nextInternalLeftIndex !== -1) {
                const actualIndex = validInternalPositions.length - 1 - nextInternalLeftIndex;
                setInternalPosition(validInternalPositions[actualIndex]);
              } else {
                // Hit left edge, try to move to previous parent tile
                const validPositions = getValidPositions();
                const nextParentLeftIndex = [...validPositions]
                  .reverse()
                  .findIndex(pos => pos.y === selectedPosition.y && pos.x < selectedPosition.x);
                if (nextParentLeftIndex !== -1) {
                  setExpandedTile(null);
                  setInternalPosition({ x: 0, y: 0 });
                  const actualIndex = validPositions.length - 1 - nextParentLeftIndex;
                  setSelectedPosition(validPositions[actualIndex]);
                }
              }
              break;
              
            case "ArrowDown":
              e.preventDefault();
              const nextInternalDownIndex = validInternalPositions.findIndex(
                pos => pos.x === internalPosition.x && pos.y > internalPosition.y
              );
              if (nextInternalDownIndex !== -1) {
                setInternalPosition(validInternalPositions[nextInternalDownIndex]);
              } else {
                // Hit bottom edge, try to move to parent tile below
                const validPositions = getValidPositions();
                const nextParentDownIndex = validPositions.findIndex(
                  pos => pos.x === selectedPosition.x && pos.y > selectedPosition.y
                );
                if (nextParentDownIndex !== -1) {
                  setExpandedTile(null);
                  setInternalPosition({ x: 0, y: 0 });
                  setSelectedPosition(validPositions[nextParentDownIndex]);
                }
              }
              break;
              
            case "ArrowUp":
              e.preventDefault();
              const nextInternalUpIndex = [...validInternalPositions]
                .reverse()
                .findIndex(pos => pos.x === internalPosition.x && pos.y < internalPosition.y);
              if (nextInternalUpIndex !== -1) {
                const actualIndex = validInternalPositions.length - 1 - nextInternalUpIndex;
                setInternalPosition(validInternalPositions[actualIndex]);
              } else {
                // Hit top edge, try to move to parent tile above
                const validPositions = getValidPositions();
                const nextParentUpIndex = [...validPositions]
                  .reverse()
                  .findIndex(pos => pos.x === selectedPosition.x && pos.y < selectedPosition.y);
                if (nextParentUpIndex !== -1) {
                  setExpandedTile(null);
                  setInternalPosition({ x: 0, y: 0 });
                  const actualIndex = validPositions.length - 1 - nextParentUpIndex;
                  setSelectedPosition(validPositions[actualIndex]);
                }
              }
              break;

            case "Alt": // Option key - toggle expansion (exit if expanded)
              e.preventDefault();
              setExpandedTile(null);
              setInternalPosition({ x: 0, y: 0 });
              break;
              
            case "Enter":
              e.preventDefault();
              const selectedChild = getChildAtInternalPosition(expandedItem, internalPosition.x, internalPosition.y);
              if (selectedChild) {
                console.log("Selected child:", selectedChild.title);
                onClose();
              }
              break;
              
            case "Tab": // Tab key - back to Cortex dashboard
              e.preventDefault();
              onClose();
              break;
              
            case "Escape":
              e.preventDefault();
              setExpandedTile(null);
              setInternalPosition({ x: 0, y: 0 });
              break;
          }
          return;
        }
      }

      // Main grid navigation
      const validPositions = getValidPositions();
      
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          const nextRightIndex = validPositions.findIndex(
            pos => pos.y === selectedPosition.y && pos.x > selectedPosition.x
          );
          if (nextRightIndex !== -1) {
            setSelectedPosition(validPositions[nextRightIndex]);
          }
          break;
          
        case "ArrowLeft":
          e.preventDefault();
          const nextLeftIndex = [...validPositions]
            .reverse()
            .findIndex(pos => pos.y === selectedPosition.y && pos.x < selectedPosition.x);
          if (nextLeftIndex !== -1) {
            const actualIndex = validPositions.length - 1 - nextLeftIndex;
            setSelectedPosition(validPositions[actualIndex]);
          }
          break;
          
        case "ArrowDown":
          e.preventDefault();
          const nextDownIndex = validPositions.findIndex(
            pos => pos.x === selectedPosition.x && pos.y > selectedPosition.y
          );
          if (nextDownIndex !== -1) {
            setSelectedPosition(validPositions[nextDownIndex]);
          }
          break;
          
        case "ArrowUp":
          e.preventDefault();
          const nextUpIndex = [...validPositions]
            .reverse()
            .findIndex(pos => pos.x === selectedPosition.x && pos.y < selectedPosition.y);
          if (nextUpIndex !== -1) {
            const actualIndex = validPositions.length - 1 - nextUpIndex;
            setSelectedPosition(validPositions[actualIndex]);
          }
          break;

        case "Alt": // Option key - toggle tile expansion
          e.preventDefault();
          const selectedItem = getItemAtPosition(selectedPosition.x, selectedPosition.y);
          if (selectedItem?.children && selectedItem.children.length > 0) {
            if (expandedTile === selectedItem.id) {
              // Already expanded, collapse it
              setExpandedTile(null);
              setInternalPosition({ x: 0, y: 0 });
            } else {
              // Not expanded, expand it
              setExpandedTile(selectedItem.id);
              setInternalPosition({ x: 0, y: 0 });
            }
          }
          break;
          
        case "Tab": // Tab key - back to Cortex dashboard
          e.preventDefault();
          onClose();
          break;
          
        case "Enter":
          e.preventDefault();
          const currentItem = getItemAtPosition(selectedPosition.x, selectedPosition.y);
          if (currentItem) {
            if (currentItem.children && currentItem.children.length > 0) {
              // For items with children, toggle expansion
              if (expandedTile === currentItem.id) {
                setExpandedTile(null);
                setInternalPosition({ x: 0, y: 0 });
              } else {
                setExpandedTile(currentItem.id);
                setInternalPosition({ x: 0, y: 0 });
              }
            } else {
              // For leaf items, execute selection
              handleSelectItem(currentItem);
            }
          }
          break;
          
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedPosition, internalPosition, expandedTile, filteredItems, onClose]);

  const handleSelectItem = (item: NavigatorItem) => {
    if (item.children && item.children.length > 0) {
      // Expand tile inline
      setExpandedTile(item.id);
      setInternalPosition({ x: 0, y: 0 });
    } else {
      // Handle selection of leaf items
      console.log("Selected:", item.title);
      onClose();
    }
  };

  const getItemIcon = (item: NavigatorItem) => {
    const IconComponent = item.icon;
    const iconClasses = cn(
      "w-full h-full",
      item.type === "app" ? "text-primary" :
      item.type === "folder" ? "text-amber-500" :
      item.type === "action" ? "text-emerald-500" :
      "text-gray-500"
    );
    
    return <IconComponent className={iconClasses} />;
  };

  const getTypeIndicator = (type: string) => {
    const colors = {
      app: "bg-blue-50 text-primary",
      folder: "bg-amber-50 text-amber-600",
      action: "bg-emerald-50 text-emerald-600",
      tab: "bg-gray-50 text-gray-500"
    };
    
    return (
      <div className={cn(
        "absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-medium",
        colors[type as keyof typeof colors] || colors.tab
      )}>
        {type}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 bg-black/20 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-4xl h-fit max-h-[95vh] overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Search */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
            <img 
                src="/icons/cortexlogov1invert.svg" 
                alt="Cortex Logo" 
                className="h-8 w-8"
/>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Spatial Navigator</h3>
                {expandedTile && (
                  <p className="text-xs text-gray-500">In-tile view</p>
                )}
              </div>
            </div>
  
            <div className="relative w-64">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  <input
    ref={searchInputRef}
    type="text"
    placeholder="Search workspace..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground font-medium transition-all
               focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-blue-50"
  />
</div>

          </div>
  
          {/* Tab to return */}
          <div className="flex items-center justify-center px-6 py-2 bg-blue-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="px-2 py-1 bg-primary text-white rounded text-xs font-mono">⇥</span>
              <span>Press Tab to return to Cortex Dashboard</span>
            </div>
          </div>
  
          {/* Spatial Grid */}
          <div className="p-3 overflow-hidden flex items-center justify-center">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">No results found for "{query}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 w-full max-w-2xl" style={{ aspectRatio: '3/3' }}>
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                  const x = index % GRID_COLS;
                  const y = Math.floor(index / GRID_COLS);
                  const item = filteredItems.find(item => item.gridPosition?.x === x && item.gridPosition?.y === y);
                  const isSelected = selectedPosition.x === x && selectedPosition.y === y;
                  const isExpanded = item?.id === expandedTile;
  
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={cn(
                        "relative aspect-square rounded-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
                        item ? "bg-white border-gray-200 hover:border-primary shadow-sm hover:shadow-md" : "border-dashed border-gray-200",
                        isSelected && item ? "ring-2 ring-primary border-primary bg-blue-50 scale-105" : "",
                        !item && isSelected ? "border-primary/50" : "",
                        isExpanded ? "bg-gray-50" : ""
                      )}
                      onClick={() => item && handleSelectItem(item)}
                    >
                      {item && (
                        <>
                          {!isExpanded && (
                            <>
                              {getTypeIndicator(item.type)}
                              <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                                <div className="w-5 h-5 mb-1">{getItemIcon(item)}</div>
                                <h3 className={cn(
                                  "font-semibold text-xs mb-0.5 line-clamp-2",
                                  isSelected ? "text-primary" : "text-gray-900"
                                )}>{item.title}</h3>
                                {item.subtitle && (
                                  <p className="text-[10px] text-gray-500 line-clamp-1">{item.subtitle}</p>
                                )}
                                {item.shortcut && (
                                  <span className="absolute bottom-1 left-1 text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{item.shortcut}</span>
                                )}
                                {item.children && item.children.length > 0 && (
                                  <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                                    <span className="text-[9px] text-primary font-medium">⌥</span>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
  
                          {isExpanded && item.children && (
                            <div className="absolute inset-2 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 p-2 border-b border-gray-100">
                                <div className="w-4 h-4">
                                  <item.icon className="w-full h-full text-primary" />
                                </div>
                                <span className="text-xs font-medium text-gray-900 line-clamp-1">{item.title}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 p-2 h-[calc(100%-2.5rem)]">
                                {Array.from({ length: 4 }).map((_, childIndex) => {
                                  const childX = childIndex % 2;
                                  const childY = Math.floor(childIndex / 2);
                                  const child = item.children![childIndex];
                                  const isChildSelected = expandedTile === item.id && internalPosition.x === childX && internalPosition.y === childY;
  
                                  return (
                                    <div
                                      key={`child-${childX}-${childY}`}
                                      className={cn(
                                        "relative rounded-lg border transition-all duration-200",
                                        child ? "bg-white border-gray-200 hover:border-primary" : "border-dashed border-gray-200",
                                        isChildSelected && child ? "border-primary bg-blue-50 scale-105" : "",
                                        !child && isChildSelected ? "border-primary/50" : ""
                                      )}
                                    >
                                      {child && (
                                        <div className="flex flex-col items-center justify-center h-full p-1 text-center">
                                          <child.icon className="w-3 h-3 mb-1 text-gray-500" />
                                          <span className={cn("text-[10px] font-medium line-clamp-2", isChildSelected ? "text-primary" : "text-gray-900")}>{child.title}</span>
                                        </div>
                                      )}
                                      {isChildSelected && child && (
                                        <div className="absolute inset-0 rounded-lg bg-primary/10" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
  
                          {isSelected && !isExpanded && (
                            <div className="absolute inset-0 rounded-xl bg-primary/5" />
                          )}
                        </>
                      )}
                      {!item && isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-primary/5 border-primary/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
  
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                <ArrowLeft className="w-3 h-3" />
                <ArrowRight className="w-3 h-3" />
                <span>{expandedTile ? "Navigate inside" : "Navigate"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌥</span>
                <span>{expandedTile ? "Collapse" : "Expand"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⇥</span>
                <span>Back to Cortex</span>
              </div>
              <div className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                <span>Select</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {filteredItems.length} items {expandedTile && "• In-tile view"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}