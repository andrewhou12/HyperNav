import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Command, Folder, Monitor, FileText, Settings, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

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
  activeTab?: string; // ID of currently selected tab for apps
}

interface QuickNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationLevel {
  items: NavigatorItem[];
  title: string;
  parentId?: string;
  parentPosition?: { x: number; y: number }; // Store the position we came from
}

// Enhanced data with 3-level hierarchy
const navigatorData: NavigatorItem[] = [
  {
    id: "chrome",
    title: "Chrome",
    subtitle: "8 tabs open",
    icon: Monitor,
    type: "app",
    activeTab: "tab2", // Gmail is currently active
    gridPosition: { x: 0, y: 0 },
    children: [
      { 
        id: "tab1", 
        title: "React Docs", 
        subtitle: "reactjs.org", 
        icon: FileText, 
        type: "tab", 
        parent: "chrome",
        gridPosition: { x: 0, y: 0 },
      },
      { 
        id: "tab2", 
        title: "Gmail", 
        subtitle: "mail.google.com", 
        icon: FileText, 
        type: "tab", 
        parent: "chrome",
        gridPosition: { x: 1, y: 0 },
        children: [
          { id: "inbox", title: "Inbox", subtitle: "12 unread", icon: FileText, type: "folder", gridPosition: { x: 0, y: 0 } },
          { id: "sent", title: "Sent", subtitle: "Last: 2h ago", icon: FileText, type: "folder", gridPosition: { x: 1, y: 0 } },
          { id: "drafts", title: "Drafts", subtitle: "3 drafts", icon: FileText, type: "folder", gridPosition: { x: 0, y: 1 } },
          { id: "labels", title: "Labels", subtitle: "Work, Personal", icon: Folder, type: "folder", gridPosition: { x: 1, y: 1 } },
        ]
      },
      { 
        id: "tab3", 
        title: "Figma", 
        subtitle: "figma.com", 
        icon: FileText, 
        type: "tab", 
        parent: "chrome",
        gridPosition: { x: 0, y: 1 },
      },
      { 
        id: "tab4", 
        title: "GitHub", 
        subtitle: "github.com/cortex", 
        icon: FileText, 
        type: "tab", 
        parent: "chrome",
        gridPosition: { x: 1, y: 1 },
      },
    ]
  },
  {
    id: "vscode",
    title: "VS Code",
    subtitle: "5 files open",
    icon: Monitor,
    type: "app",
    activeTab: "file1", // Navigator.tsx is currently active
    gridPosition: { x: 1, y: 0 },
    children: [
      { 
        id: "file1", 
        title: "Navigator.tsx", 
        subtitle: "src/components/", 
        icon: FileText, 
        type: "tab", 
        parent: "vscode",
        gridPosition: { x: 0, y: 0 },
        children: [
          { id: "imports", title: "Imports", subtitle: "Line 1-10", icon: FileText, type: "folder", gridPosition: { x: 0, y: 0 } },
          { id: "component", title: "Component", subtitle: "Line 50-200", icon: FileText, type: "folder", gridPosition: { x: 1, y: 0 } },
          { id: "hooks", title: "Hooks", subtitle: "Line 20-49", icon: FileText, type: "folder", gridPosition: { x: 0, y: 1 } },
          { id: "types", title: "Types", subtitle: "Line 11-19", icon: FileText, type: "folder", gridPosition: { x: 1, y: 1 } },
        ]
      },
      { 
        id: "file2", 
        title: "index.css", 
        subtitle: "src/", 
        icon: FileText, 
        type: "tab", 
        parent: "vscode",
        gridPosition: { x: 1, y: 0 },
      },
      { 
        id: "file3", 
        title: "App.tsx", 
        subtitle: "src/", 
        icon: FileText, 
        type: "tab", 
        parent: "vscode",
        gridPosition: { x: 0, y: 1 },
      },
    ]
  },
  {
    id: "notion",
    title: "Notion",
    subtitle: "Workspace",
    icon: Monitor,
    type: "app",
    activeTab: "page1",
    gridPosition: { x: 2, y: 0 },
    children: [
      { 
        id: "page1", 
        title: "Roadmap", 
        subtitle: "Planning", 
        icon: FileText, 
        type: "tab", 
        parent: "notion",
        gridPosition: { x: 0, y: 0 },
      },
      { 
        id: "page2", 
        title: "Notes", 
        subtitle: "Team", 
        icon: FileText, 
        type: "tab", 
        parent: "notion",
        gridPosition: { x: 1, y: 0 },
      },
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
      { id: "chrome-ref", title: "Chrome", subtitle: "8 tabs", icon: Monitor, type: "app", gridPosition: { x: 0, y: 0 } },
      { id: "vscode-ref", title: "VS Code", subtitle: "5 files", icon: Monitor, type: "app", gridPosition: { x: 1, y: 0 } },
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
  let currentAppPosition;
  currentAppPosition = {x: 0, y: 0}; //replace this with what actual current app is based on liveworkspace in the future
  const [query, setQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(currentAppPosition);
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([
    { items: navigatorData, title: "Workspace", parentId: undefined }
  ]);
//   const [filteredItems, setFilteredItems] = useState<NavigatorItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLevel = navigationStack[navigationStack.length - 1];
  const isRootLevel = navigationStack.length === 1;
  const canGoDeeper = navigationStack.length < 3;

  // Flatten all items for search
  const getAllItems = useCallback((): NavigatorItem[] => {
    const flattenItems = (items: NavigatorItem[], level = 0): NavigatorItem[] => {
      let result: NavigatorItem[] = [];
      
      for (const item of items) {
        result.push(item);
        if (item.children && level < 2) { // Max 3 levels
          result = result.concat(flattenItems(item.children, level + 1));
        }
      }
      
      return result;
    };
    
    return flattenItems(navigatorData);
  }, []);

  // Filter items based on search query across all levels
   let filteredItems: NavigatorItem[] = [];
    if (query === "") {
      filteredItems = currentLevel.items;
    } else {
         // Search across all levels
    const allItems = getAllItems();
    const searchResults = allItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    // If searching, show results in current grid format
    const resultsWithPositions = searchResults.map((item, index) => ({
      ...item,
      gridPosition: {
        x: index % GRID_COLS,
        y: Math.floor(index / GRID_COLS)
      }
    }));

    filteredItems = resultsWithPositions;
    }
 
  // Reset to root level and focus search input when opened


  useEffect(() => {
    if (isOpen) {
      setNavigationStack([{ items: navigatorData, title: "Workspace", parentId: undefined }]);
      setSelectedPosition(currentAppPosition);
      setQuery("");
  
      const timeout = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 20);  // 20ms is the sweet spot—no visible lag, high reliability
  
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Get item at specific grid position
  const getItemAtPosition = (x: number, y: number) => {
    return filteredItems.find(item => 
      item.gridPosition?.x === x && item.gridPosition?.y === y
    ) || null;
  };

  // Get valid positions
  const getValidPositions = () => {
    return filteredItems.map(item => item.gridPosition).filter(pos => pos) as { x: number; y: number }[];
  };

  // Navigate to children (zoom in)
  const navigateToChildren = (item: NavigatorItem) => {
    if (!item.children || !canGoDeeper) return;

    const positionToSave = selectedPosition;

    const newLevel: NavigationLevel = {
      items: item.children,
      title: item.title,
      parentId: item.id,
      parentPosition: positionToSave  // Store current position to return to
    };

    setNavigationStack(prev => [...prev, newLevel]);
    setSelectedPosition({ x: 0, y: 0 }); //<- fix hard coded logic in the future
    setQuery(""); // Clear search when navigating
  };

  // Navigate back (zoom out)
  const navigateBack = () => {
    if (isRootLevel) return;

    const originalPosition = navigationStack[navigationStack.length-1]?.parentPosition;
    console.log(originalPosition);
    //grab the parent position before we exist the stack    
    
    setNavigationStack(prev => prev.slice(0, -1));
    
    // Restore selection to the position we came from
    if (originalPosition) {
    
      setSelectedPosition(originalPosition);
    } else {
      setSelectedPosition(currentAppPosition);
    }
    
    setQuery(""); // Clear search when navigating
  };

  // Navigate to specific level
  const navigateToLevel = (levelIndex: number) => {
    if (levelIndex < 0 || levelIndex >= navigationStack.length) return;

    setNavigationStack(prev => prev.slice(0, levelIndex + 1));
    setSelectedPosition({ x: 0, y: 0 });
    setQuery(""); // Clear search when navigating
  };

  // Handle spatial navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const validPositions = getValidPositions();
      
      // Handle Shift key for returning to Cortex dashboard
     if (e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey) {
  e.preventDefault();
  onClose();
  return;
}

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

  case "Tab": // Tab key - navigate into children (zoom in)
    e.preventDefault();
    const selectedItem = getItemAtPosition(selectedPosition.x, selectedPosition.y);
    if (selectedItem?.children && canGoDeeper) {
      navigateToChildren(selectedItem);
    }
    break;

  case "Enter":
    e.preventDefault();
    const currentItem = getItemAtPosition(selectedPosition.x, selectedPosition.y);
    if (currentItem) {
      if (currentItem.type === "app" && currentItem.activeTab) {
        console.log(`Activating ${currentItem.title} - switching to tab: ${currentItem.activeTab}`);
      } else {
        console.log(`Activating: ${currentItem.title}`);
      }
      window.electron.ipcRenderer.send('hide-overlay');
    }
    break;

  case "Alt": // Option key - go back
    e.preventDefault();
    if (!isRootLevel) {
      navigateBack();
    }
    break;

  case "Escape":
      e.preventDefault();
      window.electron.ipcRenderer.send('hide-overlay', { reason: 'escape' });
      setSelectedPosition(currentAppPosition);
      break;
}

    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedPosition, onClose, filteredItems, isRootLevel, canGoDeeper]);

  const handleSelectItem = (item: NavigatorItem) => {
    if (item.children && canGoDeeper) {
      navigateToChildren(item);
    } else {
      // Activate item
      if (item.type === "app" && item.activeTab) {
        console.log(`Activating ${item.title} - switching to tab: ${item.activeTab}`);
      } else {
        console.log(`Activating: ${item.title}`);
      }
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
    <div
      className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden scrollbar-hidden"
      onClick={onClose}  // Clicking outside closes overlay
    >
      <div
        ref={containerRef}
        className="w-full max-w-4xl rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden scrollbar-hidden"
        onClick={(e) => e.stopPropagation()}  // Prevent click from bubbling
      >
        {/* Header with Search and Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="/icons/cortexlogov1invert.svg"
              alt="Cortex Logo"
              className="h-8 w-8"
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Spatial Navigator</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 h-5 overflow-hidden">
                <button
                  onClick={() => navigateToLevel(0)}
                  className="hover:text-primary transition-colors"
                >
                  <Home className="w-3 h-3" />
                </button>
                {navigationStack.map((level, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-3 h-3" />}
                    <button
                      onClick={() => navigateToLevel(index)}
                      className={cn(
                        "hover:text-primary transition-colors",
                        index === navigationStack.length - 1 ? "text-primary font-medium" : ""
                      )}
                    >
                      {level.title}
                    </button>
                  </div>
                ))}
                {!isRootLevel && (
                  <div className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    Level {navigationStack.length}
                  </div>
                )}
              </div>
            </div>
          </div>
  
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search all levels..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-blue-50"
            />
          </div>
        </div>
  
        {/* Navigation hint */}
        <div className="flex items-center justify-center px-6 py-2 bg-blue-50 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <span className="px-2 py-1 bg-primary text-white rounded text-xs font-mono">⇧</span>
            <span>Press Shift to return to Cortex Dashboard</span>
            {!isRootLevel && (
              <>
                <span className="text-gray-300">•</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">⌥</span>
                <span>Option to go back</span>
              </>
            )}
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
  
                return (
                  <div
                    key={`${x}-${y}`}
                    className={cn(
                      "relative aspect-square rounded-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
                      item ? "bg-white border-gray-200 hover:border-primary shadow-sm hover:shadow-md" : "border-dashed border-gray-200",
                      isSelected && item ? "ring-2 ring-primary border-primary bg-blue-50 scale-105" : "",
                      !item && isSelected ? "border-primary/50" : ""
                    )}
                    onClick={() => item && handleSelectItem(item)}
                  >
                    {item && (
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
                          {item.type === "app" && item.activeTab && (
                            <div className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          )}
                          {item.children && item.children.length > 0 && canGoDeeper && (
                            <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                              <span className="text-[9px] text-primary font-medium">⇥</span>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                        {isSelected && (
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
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⇥</span>
              <span>Zoom in</span>
            </div>
            <div className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              <span>Activate</span>
            </div>
            {!isRootLevel && (
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌥</span>
                <span>Back</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {filteredItems.length} items • Level {navigationStack.length}/{3}
          </div>
        </div>
  
      </div>
    </div>
  );
  
}