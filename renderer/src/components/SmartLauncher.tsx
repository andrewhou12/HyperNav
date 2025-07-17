import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Search } from "lucide-react";
import Fuse from "fuse.js";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface AppItem {
  name: string;
  path: string;
  icon?: string;
}

interface SmartLauncherProps {
  isOpen: boolean;
  onClose: (reason?: 'escape' | 'shift' | 'other') => void;
  onChromeSearch?: (query: string) => void;
  withBackdrop?: boolean;
}

type ResultItem =
  | { type: "app"; app: AppItem }
  | { type: "chrome"; query: string };

function AppListItem({ app, isSelected, onClick }: { app: AppItem; isSelected: boolean; onClick: () => void; }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.1 }}
      className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      <img src={app.icon || '/icons/default-app.png'} alt="" className="w-6 h-6 rounded flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">{app.name}</div>
      </div>
    </motion.div>
  );
}

export function SmartLauncher({ isOpen, onClose, onChromeSearch, withBackdrop = true }: SmartLauncherProps) {
  const [availableApps, setAvailableApps] = useState<AppItem[]>([]);
  const [recentApps, setRecentApps] = useState<AppItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = new Fuse<AppItem>(availableApps, { keys: ["name"], threshold: 0.4 });
  const filteredApps = query ? fuse.search(query).map(r => r.item) : recentApps;

  const results: ResultItem[] = [
    ...filteredApps.map(app => ({ type: "app", app })),
    ...(query ? [{ type: "chrome", query }] : []),
  ];

  useEffect(() => {
    if (!isOpen) return;
  
    const fetchApps = async () => {
      try {
        const cached = await window.electron.getPreloadedApps?.();
        if (cached && cached.length > 0) {
          setAvailableApps(cached);
        } else {
          const fresh = await window.electron.getInstalledApps?.();
          setAvailableApps(fresh);
        }
      } catch (err) {
        console.error("Failed to fetch apps:", err);
      }
    };
  
    fetchApps();
    window.electron.getRecentApps?.().then(setRecentApps).catch(console.error);
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "Escape" || (e.altKey && e.key === "Enter")) {
      onClose('escape');
      return;
    }

    const selected = results[selectedIndex];
    if (!selected) return;

    if (e.key === "Enter" && e.shiftKey) {
      if (onChromeSearch && query.trim()) {
        toast.loading(`Opening Chrome search for “${query}”`, { id: 'action' });
        onChromeSearch(query);
        toast.success("Search opened", { id: 'action' });
        onClose('escape');
      }
      return;
    }

    if (e.key === "Enter") {
      if (selected.type === "app") {
        const appName = selected.app.name;
        toast.loading(`Launching ${appName}…`, { id: 'action' });
        window.electron.smartLaunchApp?.(selected.app)
          .then(res => {
            toast.success(res?.message || `${appName} launched.`, { id: 'action' });
            onClose('escape');
          })
          .catch(() => {
            toast.error(`Failed to launch ${appName}.`, { id: 'action' });
            onClose('escape');
          });
      } else if (selected.type === "chrome") {
        toast.loading(`Opening Chrome search for “${selected.query}”`, { id: 'action' });
        onChromeSearch?.(selected.query);
        toast.success("Search opened", { id: 'action' });
        onClose('escape');
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) setSelectedIndex(prev => (prev + 1) % results.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) setSelectedIndex(prev => (prev === 0 ? results.length - 1 : prev - 1));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, results, onClose, onChromeSearch]);

  if (!isOpen) return null;

  const launcherCard = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl relative"
      onClick={e => e.stopPropagation()}
    >
      <div className="glass rounded-2xl p-6 mb-4 border border-border">
        <div className="relative">
          <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to launch apps or search the web…"
            className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-lg placeholder-muted-foreground"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl px-4 py-3 mb-4 border border-border">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">↵</span>
            <span>Launch app</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">⇧</span>
            <span className="text-xs">+</span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">↵</span>
            <span>Search in Chrome</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass rounded-xl overflow-hidden border border-border">
            <div className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-3">{filteredApps.length > 0 ? "Apps" : "Search"}</div>
              <div className="space-y-1">
                {results.map((result, idx) => result.type === "app" ? (
                  <AppListItem key={result.app.path} app={result.app} isSelected={idx === selectedIndex} onClick={() => {
                    setSelectedIndex(idx);
                    const appName = result.app.name;
                    toast.loading(`Launching ${appName}…`, { id: 'action' });
                    window.electron.smartLaunchApp?.(result.app).then(res => {
                      toast.success(res?.message || `${appName} launched.`, { id: 'action' });
                      onClose('escape');
                    }).catch(() => {
                      toast.error(`Failed to launch ${appName}.`, { id: 'action' });
                      onClose('escape');
                    });
                  }}
                  />
                ) : (
                  <motion.div key={`search-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }} className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${idx === selectedIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`} onClick={() => {
                    setSelectedIndex(idx);
                    toast.loading("Opening Chrome search…", { id: 'action' });
                    onChromeSearch?.(result.query);
                    toast.success("Search opened", { id: 'action' });
                    onClose('escape');
                  }}>
                    <Search className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">Search in Chrome: “{result.query}”</div>
                      <div className="text-xs text-muted-foreground">Web Search</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return withBackdrop ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => onClose('escape')}>
      <div className="flex items-start justify-center pt-32 px-4">
        {launcherCard}
      </div>
    </motion.div>
  ) : (
    // ✅ Global Overlay version — fixed layout
    <div
    className="flex items-center justify-center p-6 min-h-screen"
      onClick={() => onClose('escape')}
    >
      <div className="w-full max-w-2xl h-[600px]">   {/* this shit is so annoying, clips slightly, fix in future */}
        {launcherCard}
      </div>
    </div>
  );
}
