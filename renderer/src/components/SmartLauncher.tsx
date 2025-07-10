import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Chrome, Monitor, Code, FileText, Calculator, Gamepad2 } from "lucide-react";

interface App {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
}

const DEMO_APPS: App[] = [
  { id: "chrome", name: "Chrome", icon: Chrome, category: "Browser" },
  { id: "vscode", name: "VS Code", icon: Code, category: "Development" },
  { id: "notion", name: "Notion", icon: FileText, category: "Productivity" },
  { id: "calculator", name: "Calculator", icon: Calculator, category: "Utility" },
  { id: "activity-monitor", name: "Activity Monitor", icon: Monitor, category: "System" },
  { id: "steam", name: "Steam", icon: Gamepad2, category: "Gaming" },
];

export interface SmartLauncherProps {
  isVisible: boolean;
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onChromeSearch?: (query: string) => void;
}

export function SmartLauncher({ 
  isVisible, 
  onClose, 
  onLaunchApp = (appId) => console.log(`Launching app: ${appId}`),
  onChromeSearch = (query) => console.log(`Chrome search: ${query}`)
}: SmartLauncherProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter apps based on query
  const filteredApps = DEMO_APPS.filter(app =>
    app.name.toLowerCase().includes(query.toLowerCase())
  );

  // Create results list with apps + chrome search option
  const results = [
    ...filteredApps.map(app => ({ type: "app" as const, app })),
    ...(query ? [{ type: "chrome" as const, query }] : [])
  ];

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Focus input when launcher becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? Math.max(results.length - 1, 0) : prev - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + Enter: Chrome search
            if (query.trim()) {
              onChromeSearch(query.trim());
              onClose();
            }
          } else {
            // Enter: Launch selected app or search
            const selectedResult = results[selectedIndex];
            if (selectedResult) {
              if (selectedResult.type === "app") {
                onLaunchApp(selectedResult.app.id);
              } else {
                onChromeSearch(selectedResult.query);
              }
              onClose();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, selectedIndex, results, query, onClose, onLaunchApp, onChromeSearch]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="flex items-start justify-center pt-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="glass rounded-2xl p-6 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Type to launch apps or search the web..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-lg placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Action Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl px-4 py-3 mb-4"
          >
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-muted rounded text-xs font-medium">↵</span>
                <span>Launch app</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-1 bg-muted rounded text-xs font-medium">⇧</span>
                  <span className="text-xs">+</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs font-medium">↵</span>
                </div>
                <span>Search in Chrome</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    {filteredApps.length > 0 ? "Apps" : "Search"}
                  </div>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.type === "app" ? result.app.id : "chrome-search"}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                          index === selectedIndex
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          if (result.type === "app") {
                            onLaunchApp(result.app.id);
                          } else {
                            onChromeSearch(result.query);
                          }
                          onClose();
                        }}
                      >
                        {result.type === "app" ? (
                          <>
                            {React.createElement(result.app.icon, { className: "w-6 h-6 flex-shrink-0" })}
                            <div className="flex-1">
                              <div className="font-medium">{result.app.name}</div>
                              {result.app.category && (
                                <div className={`text-xs ${
                                  index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {result.app.category}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Search className="w-6 h-6 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">Search in Chrome: "{result.query}"</div>
                              <div className={`text-xs ${
                                index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                Web Search
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {query && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-8 text-center"
            >
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <div className="font-medium text-muted-foreground mb-2">No apps found</div>
              <div className="text-sm text-muted-foreground">
                Try a different search or press <span className="px-2 py-1 bg-muted rounded text-xs">⇧ + ↵</span> to search in Chrome
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}