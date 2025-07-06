import React from 'react';
import { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowUp, ArrowDown } from "lucide-react";

interface QuickSwitcherItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'app' | 'tab' | 'folder' | 'action';
  icon?: string;
}

interface QuickSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: QuickSwitcherItem) => void;
}

const mockItems: QuickSwitcherItem[] = [
  { id: '1', title: 'Chrome', subtitle: '3 tabs open', type: 'app', icon: '🌐' },
  { id: '2', title: 'Slack', subtitle: 'Marketing Channel', type: 'app', icon: '💬' },
  { id: '3', title: 'VS Code', subtitle: 'cortex-dashboard', type: 'app', icon: '💻' },
  { id: '4', title: 'Gmail - Inbox', subtitle: 'Chrome • gmail.com', type: 'tab', icon: '📧' },
  { id: '5', title: 'GitHub Dashboard', subtitle: 'Chrome • github.com', type: 'tab', icon: '🐙' },
  { id: '6', title: 'Q3 Launch Plan', subtitle: 'Google Docs', type: 'tab', icon: '📄' },
  { id: '7', title: 'Work Projects', subtitle: '5 items', type: 'folder', icon: '📁' },
  { id: '8', title: 'Pause Session', subtitle: 'Stop tracking', type: 'action', icon: '⏸️' },
];

export function QuickSwitcher({ isOpen, onClose, onSelect }: QuickSwitcherProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = mockItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect?.(filteredItems[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
      <div className="w-full max-w-lg mx-4 bg-dashboard-glass backdrop-blur-xl rounded-2xl shadow-dashboard-lg border  overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b ">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, tabs, folders..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                ${index === selectedIndex ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-muted/50'}
              `}
              onClick={() => {
                onSelect?.(item);
                onClose();
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-primary' : 'text-foreground'}`}>
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-md ${
                item.type === 'app' ? 'bg-blue-100 text-blue-700' :
                item.type === 'tab' ? 'bg-green-100 text-green-700' :
                item.type === 'folder' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.type}
              </span>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t  bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.5 bg-muted rounded text-xs">⏎</span>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.5 bg-muted rounded text-xs">esc</span>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}