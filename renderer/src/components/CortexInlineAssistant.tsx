import React, { useState, useRef, useEffect } from 'react';
import { Hexagon, Sparkles, MessageSquare, Search, Zap, Send, X, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEMO_RESPONSES = [
  "I'm Cortex, your AI productivity assistant. How can I help you today?",
  "I can help you with workspace management, AI tasks, file search, and more. What would you like to do?",
  "Searching your workspace... Found 3 relevant items. Would you like me to open them?",
  "Task completed! I've organized your tabs and cleared unnecessary windows.",
  "Here's a quick summary of your current session and open tasks."
];

const tools = [
  { id: 'ai', label: 'AI', icon: Bot, active: true },
  { id: 'search', label: 'Search', icon: Search, active: false },
  { id: 'actions', label: 'Actions', icon: Zap, active: false },
];

export const CortexInlineAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

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
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  // Global hotkey simulation (spacebar for demo)
  useEffect(() => {
    const handleGlobalKeypress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isExpanded && e.target === document.body) {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    };

    document.addEventListener('keydown', handleGlobalKeypress);
    return () => document.removeEventListener('keydown', handleGlobalKeypress);
  }, [isExpanded]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
  onClick={handleToggle}
  className={cn(
    "h-12 px-4 rounded-xl bg-white border border-gray-200 shadow-sm",
    "hover:shadow-md transition-all duration-200 text-gray-900 hover:text-gray-900",
    "hover:bg-gray-50"
  )}
  variant="ghost"
>
  <img 
    src="/icons/cortexlogov1invert.svg" 
    alt="Cortex Logo" 
    className="h-5 w-5 mr-2"
  />
  <span className="text-sm font-medium">Cortex</span>
</Button>
        
        {/* Floating hint */}
        <div className="absolute -top-11 right-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 font-medium whitespace-nowrap shadow-sm">
          Press Space for Cortex
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <div className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden",
        "animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
  <div className="flex items-center gap-3">
    <img 
      src="/icons/cortexlogov1invert.svg" 
      alt="Cortex Logo" 
      className="h-8 w-8"
    />
    <div>
      <h3 className="text-sm font-semibold text-gray-900">Cortex</h3>
      <p className="text-xs text-gray-500">AI Assistant</p>
    </div>
  </div>

  <Button
    onClick={() => setIsExpanded(false)}
    variant="ghost"
    size="sm"
    className="h-7 w-7 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
  >
    <X className="h-3.5 w-3.5" />
  </Button>
</div>

        {/* Tool Tabs */}
        <div className="flex border-b border-gray-100">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-medium transition-all duration-200 relative",
                activeTab === tool.id
                  ? "text-primary bg-blue-50"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              )}
            >
              <tool.icon className="h-3.5 w-3.5" />
              {tool.label}
              {activeTab === tool.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-gray-900 font-medium">
                Welcome to Cortex
              </p>
              <p className="text-xs text-gray-500 mt-1">
                How can I assist you today?
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
                  "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                  message.type === 'user'
                    ? "bg-primary text-white font-medium"
                    : "bg-white text-gray-900 border border-gray-200 font-medium"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
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
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Cortex anything..."
                className={cn(
                  "h-11 bg-input border-border rounded-xl",
                  "focus:border-primary focus:ring-1 focus:ring-ring/20 focus:bg-white",
                  "text-foreground placeholder:text-muted-foreground",
                  "font-medium text-sm"
                )}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className={cn(
                "h-11 w-11 rounded-xl bg-primary hover:bg-primary/90",
                "transition-all duration-200 font-medium",
                "disabled:opacity-50 disabled:hover:bg-primary"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2.5 text-center">
            Press Enter to send • Esc to close
          </p>
        </div>
      </div>
    </div>
  );
};