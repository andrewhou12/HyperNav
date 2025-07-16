import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Edit, Save, X, Pin, Trash2, ClipboardList } from 'lucide-react';

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
    const saved = localStorage.getItem('cortex-clipboard-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setClipboardHistory(parsed);
      } catch (e) {
        console.warn('Failed to parse clipboard history');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cortex-clipboard-history', JSON.stringify(clipboardHistory));
  }, [clipboardHistory]);

  useEffect(() => {
    const syncClipboard = async () => {
      try {
        const content = await window.electron.getClipboardText();
        if (!content || typeof content !== 'string' || content.trim() === '') return;

        setClipboardHistory(prev => {
          const isDuplicate = prev.some(item => item.content === content && !item.isPinned);
          if (isDuplicate) return prev;

          const newItem: ClipboardItem = {
            id: Date.now().toString(),
            content,
            timestamp: new Date(),
            isPinned: false,
            type: content.startsWith('http') ? 'link' : 'text',
          };

          return [newItem, ...prev];
        });
      } catch (err) {
        console.warn('Failed to read clipboard:', err);
      }
    };

    window.addEventListener('focus', syncClipboard);
    syncClipboard(); // run once on mount
    return () => window.removeEventListener('focus', syncClipboard);
  }, []);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
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
      prev.map(item => (item.id === id ? { ...item, content: editContent } : item))
    );
    setEditingId(null);
  };

  const handlePin = (id: string) => {
    setClipboardHistory(prev =>
      prev.map(item => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
  };

  const handleDelete = (id: string) => {
    setClipboardHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setClipboardHistory(prev => prev.filter(item => item.isPinned));
  };

  const truncateText = (text: string, maxLength = 100) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

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
            .map(item => (
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
                        <button onClick={() => handleSave(item.id)} className="p-1 hover:bg-muted rounded-lg">
                          <Save className="w-4 h-4 text-primary" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 hover:bg-muted rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleCopy(item.content)} className="p-1 hover:bg-muted rounded-lg">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(item.id, item.content)} className="p-1 hover:bg-muted rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePin(item.id)}
                          className={`p-1 hover:bg-muted rounded-lg ${item.isPinned ? 'text-primary' : ''}`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-muted rounded-lg text-destructive">
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
