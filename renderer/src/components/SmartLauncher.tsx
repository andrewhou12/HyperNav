import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Search } from "lucide-react";
import Fuse from "fuse.js";
import toast from "react-hot-toast";

interface AppItem {
  name: string;
  path: string;
  icon?: string;
}

interface SmartLauncherProps {
  isVisible: boolean;
  onClose: () => void;
  onChromeSearch?: (query: string) => void;
}

type ResultItem =
  | { type: "app"; app: AppItem }
  | { type: "chrome"; query: string };

export function SmartLauncher({
  isVisible,
  onClose,
  onChromeSearch
}: SmartLauncherProps) {
  const [availableApps, setAvailableApps] = useState<AppItem[]>([]);
  const [recentApps, setRecentApps] = useState<AppItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = new Fuse<AppItem>(availableApps, {
    keys: ["name"],
    threshold: 0.4,
  });

  const filteredApps = query
    ? fuse.search(query).map((r) => r.item)
    : recentApps;

  const results: ResultItem[] = [
    ...filteredApps.map((app) => ({ type: "app", app })),
    ...(query ? [{ type: "chrome", query }] : []),
  ];

  useEffect(() => {
    if (!isVisible) return;
    window.electron.getInstalledApps?.()
      .then(setAvailableApps)
      .catch(console.error);
    window.electron.getRecentApps?.()
      .then(setRecentApps)
      .catch(console.error);
    inputRef.current?.focus();
  }, [isVisible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isVisible) return;
  
    if (e.key === "Escape" || (e.altKey && e.key === "Enter")) {
      onClose();
      return;
    }
  
    const selected = results[selectedIndex];
    if (!selected) return;
  
    if (e.key === "Enter" && e.shiftKey) {
      if (onChromeSearch && query.trim()) {
        toast.loading(`Opening Chrome search for “${query}”`, { id: 'action' });
        onChromeSearch(query);
        toast.success("Search opened", { id: 'action' });
        onClose();
      }
      return;
    }
  
    if (e.key === "Enter") {
      if (selected.type === "app") {
        toast.loading(`Launching ${selected.app.name}…`, { id: 'action' });
        window.electron.smartLaunchApp?.(selected.app)
          .then((res: { message?: string }) => {
            toast.success(res?.message || "App launched", { id: 'action' });
            onClose();
          })
          .catch(() => {
            toast.error("Failed to launch app", { id: 'action' });
            onClose();
          });
      } else {
        toast.loading("Opening Chrome search…", { id: 'action' });
        onChromeSearch?.(selected.query);
        toast.success("Search opened", { id: 'action' });
        onClose();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, selectedIndex, results, onClose, onChromeSearch]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
      onClick={() => onClose()}
    >
      <div className="flex items-start justify-center pt-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass rounded-2xl p-6 mb-4">
            <div className="relative">
              <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to launch apps or search the web…"
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-lg placeholder-muted-foreground"
              />
            </div>
          </div>

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

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    {filteredApps.length > 0 ? "Apps" : "Search"}
                  </div>
                  <div className="space-y-1">
                    {results.map((result, idx) => (
                      <motion.div
                        key={result.type === "app" ? result.app.path : `search-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${
                          idx === selectedIndex
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedIndex(idx);
                          const sel = results[idx];
                          if (sel.type === "app") {
                            toast.loading(`Launching ${sel.app.name}…`, { id: 'action' });
                            window.electron.smartLaunchApp?.(sel.app)
                              .then((res: { message?: string }) => {
                                toast.success(res?.message || "App launched", { id: 'action' });
                                onClose();
                              })
                              .catch(() => {
                                toast.error("Failed to launch app", { id: 'action' });
                                onClose();
                              });
                          } else {
                            toast.loading("Opening Chrome search…", { id: 'action' });
                            onChromeSearch(sel.query);
                            toast.success("Search opened", { id: 'action' });
                            onClose();
                          }
                        }}
                      >
                        {result.type === "app" ? (
                          <>
                            <img src={result.app.icon} alt="" className="w-6 h-6 rounded flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">{result.app.name}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Search className="w-6 h-6 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">Search in Chrome: “{result.query}”</div>
                              <div className="text-xs text-muted-foreground">Web Search</div>
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

          {query && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-8 text-center"
            >
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <div className="font-medium text-muted-foreground mb-2">No apps found</div>
              <div className="text-sm text-muted-foreground">
                Try a different search or press
                <span className="px-2 py-1 bg-muted rounded text-xs mx-1">⇧ + ↵</span>
                to search in Chrome
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
