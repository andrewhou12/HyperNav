import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Edit, Save, X, Pin, ExternalLink, Trash2, ClipboardList } from 'lucide-react';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  isPinned: boolean;
  type: 'text' | 'image' | 'link';
}

export const ClipboardManager: React.FC = () => {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('cortex-clipboard-history');
    if (saved) {
      const parsed = JSON.parse(saved).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setClipboardHistory(parsed);
    } else {
      // Mock data for demonstration
      const mockData: ClipboardItem[] = [
        {
          id: '1',
          content: 'Hello world! This is a sample clipboard item.',
          timestamp: new Date(Date.now() - 5000),
          isPinned: true,
          type: 'text'
        },
        {
          id: '2',
          content: 'https://example.com/some-long-url-that-might-be-useful',
          timestamp: new Date(Date.now() - 15000),
          isPinned: false,
          type: 'link'
        },
        {
          id: '3',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          timestamp: new Date(Date.now() - 30000),
          isPinned: false,
          type: 'text'
        }
      ];
      setClipboardHistory(mockData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cortex-clipboard-history', JSON.stringify(clipboardHistory));
  }, [clipboardHistory]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSave = (id: string) => {
    setClipboardHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, content: editContent } : item
      )
    );
    setEditingId(null);
  };

  const handlePin = (id: string) => {
    setClipboardHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setClipboardHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setClipboardHistory(prev => prev.filter(item => item.isPinned));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Clipboard Manager</h3>
        <button
          onClick={handleClearAll}
          className="text-xs text-destructive hover:text-destructive/80 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {clipboardHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No clipboard history</p>
          </div>
        ) : (
          clipboardHistory
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
            .map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.isPinned 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card/50 border-border hover:bg-card/80'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 rounded-lg border border-border bg-background resize-none"
                        rows={3}
                        autoFocus
                      />
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-foreground break-words">
                          {truncateText(item.content)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>•</span>
                          <span className="capitalize">{item.type}</span>
                          {item.isPinned && (
                            <>
                              <span>•</span>
                              <Pin className="w-3 h-3" />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item.id)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Save className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopy(item.content)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item.id, item.content)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePin(item.id)}
                          className={`p-1 rounded-lg hover:bg-muted transition-colors ${
                            item.isPinned ? 'text-primary' : ''
                          }`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
};