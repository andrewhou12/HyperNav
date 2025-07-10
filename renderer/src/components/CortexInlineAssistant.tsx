import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Trash2, Brain, Globe, FileText, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MemoryBubble {
  id: string;
  type: 'highlight';
  content: string;
  preview: string;
}

const DEMO_RESPONSES = [
  "I'm Cortex Intelligence, your AI assistant. How can I help you today?",
  "I can analyze, explain, translate, or rephrase any text you provide. What would you like me to do?",
  "I've processed your request. Here's what I found...",
  "Based on the content you've shared, here's my analysis...",
  "Task completed! Let me know if you need any additional help."
];

interface CortexInlineAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CortexInlineAssistant: React.FC<CortexInlineAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memoryBubbles, setMemoryBubbles] = useState<MemoryBubble[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // Monitor text selection
  useEffect(() => {
    if (!isOpen) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 10) {
        const preview = selectedText.length > 40 ? selectedText.substring(0, 40) + '...' : selectedText;
        const newBubble: MemoryBubble = {
          id: `highlight-${Date.now()}`,
          type: 'highlight',
          content: selectedText,
          preview
        };
        
        setMemoryBubbles(prev => {
          // Remove existing highlight bubbles and add new one
          const filtered = prev.filter(b => b.type !== 'highlight');
          return [newBubble, ...filtered];
        });
      }
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, [isOpen]);

  // Focus input when opened and handle escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBubbleClick = (bubbleId: string) => {
    setSelectedBubble(selectedBubble === bubbleId ? null : bubbleId);
  };

  const handleRemoveBubble = (bubbleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemoryBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
    if (selectedBubble === bubbleId) {
      setSelectedBubble(null);
    }
  };

  const handleActionButton = (action: 'explain' | 'translate' | 'rephrase') => {
    if (!selectedBubble) return;
    
    const bubble = memoryBubbles.find(b => b.id === selectedBubble);
    if (!bubble) return;

    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = `Explain this: ${bubble.content}`;
        break;
      case 'translate':
        prompt = `Translate this to English: ${bubble.content}`;
        break;
      case 'rephrase':
        prompt = `Rephrase this: ${bubble.content}`;
        break;
    }
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className={cn(
        "bg-white/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl pointer-events-auto",
        "animate-in slide-in-from-bottom-4 zoom-in-95 duration-300",
        "flex flex-col overflow-hidden",
        isExpanded ? "w-[600px] h-[80vh]" : "w-96 h-auto max-h-[80vh]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cortex Intelligence</h3>
            </div>
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Memory Layer - Bubbles */}
        {memoryBubbles.length > 0 && (
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-wrap gap-2">
              {memoryBubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  onClick={() => handleBubbleClick(bubble.id)}
                  className={cn(
                    "relative group cursor-pointer rounded-lg px-3 py-2 text-xs border transition-all",
                    selectedBubble === bubble.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="truncate max-w-[120px]">{bubble.preview}</span>
                    <button
                      onClick={(e) => handleRemoveBubble(bubble.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 space-y-3",
          isExpanded ? "min-h-[40vh]" : "max-h-64"
        )}>
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">
                Welcome to Cortex Intelligence
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {memoryBubbles.length === 0 
                  ? "Highlight text to create memory bubbles" 
                  : "Select a memory bubble or ask me anything"
                }
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border rounded-xl px-3 py-2 text-sm">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 bg-card border-t border-border/50">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything..."
                className={cn(
                  "h-10 bg-background border-border rounded-lg",
                  "focus:border-primary focus:ring-1 focus:ring-primary/20",
                  "text-foreground placeholder:text-muted-foreground",
                  "text-sm"
                )}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="h-10 w-10 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Action & Utility Row */}
          <div className="flex items-center justify-between">
            {/* Action Buttons (Left) */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleActionButton('explain')}
                disabled={!selectedBubble}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                Explain
              </Button>
              <Button
                onClick={() => handleActionButton('translate')}
                disabled={!selectedBubble}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                Translate
              </Button>
              <Button
                onClick={() => handleActionButton('rephrase')}
                disabled={!selectedBubble}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                Rephrase
              </Button>
            </div>

            {/* Utility Buttons (Right) */}
            <div className="flex gap-2">
              <Button
                onClick={handleClearChat}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear Chat
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Close
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Enter to send • Esc to close
          </p>
        </div>
      </div>
    </div>
  );
};