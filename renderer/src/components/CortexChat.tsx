import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowUp, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function CortexChat() {
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

//chat history
  useEffect(() => {
    const stored = localStorage.getItem('cortex-chat-history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp), // rehydrate timestamp
          }))
        );
      } catch (e) {
        console.warn("Failed to load saved chat:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem('cortex-chat-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);


  const handleClearChat = () => {
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
    localStorage.removeItem('cortex-chat-history');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
  
    try {
      // 👇 Change this to use your GPT backend
      const aiResponseText = await window.electron.askGPT({
        userInput: inputValue,
        currentContext: "",        // optional, add if you want context-awareness
        includeContext: true       // toggle based on user preference or logic
      });
  
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      };
  
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "❌ Error fetching AI response. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error("GPT error:", error);
    }
  
    setIsLoading(false);
  };
  
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-muted-foreground ml-2">Cortex is thinking...</span>
    </div>
  );

  // Landing state when no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        {/* Floating orbs for magical ambiance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-accent/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-primary/8 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Centered landing content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
            <img
            src="/icons/cortexlogov3.svg"
            alt="Cortex"
            className="w-7 h-7 flex-shrink-0"
          />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl font-medium text-foreground mb-4 tracking-tight">
              What are you working on?
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              I can help you understand your work sessions, analyze productivity patterns, and provide insights about your activities.
            </p>
          </div>

          {/* Input bar */}
          <div className="w-full">
            <div className="flex items-end gap-3 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-lg">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about your work sessions, productivity patterns, or anything else..."
                className="flex-1 bg-transparent resize-none border-none outline-none text-sm placeholder:text-muted-foreground/70 min-h-[20px] max-h-32 py-2"
                disabled={isLoading}
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-sm'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            
            {/* Subtle hint */}
            <p className="text-xs text-muted-foreground/60 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Floating orbs for magical ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-accent/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-primary/8 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Minimal header */}
      <div className="flex items-center justify-between p-6 relative">
        <div></div> {/* Left spacer */}
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50 shadow-sm">
        <img
            src="/icons/cortexlogov3.svg"
            alt="Cortex"
            className="w-7 h-7 flex-shrink-0"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">Cortex Intelligence</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-card/50 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all duration-200 hover:scale-105"
          title="Clear chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group flex items-start gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'ai' 
                  ? 'bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20' 
                  : 'bg-muted/80 border border-border/50'
              }`}>
                {message.type === 'ai' ? (
                  <Sparkles className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-3 h-3 bg-foreground/70 rounded-full" />
                )}
              </div>

              {/* Message bubble */}
              <div className={`relative max-w-[75%] ${message.type === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`relative rounded-2xl px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                    message.type === 'user'
                      ? 'bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary'
                      : 'bg-card/80 text-foreground border border-border/50 hover:bg-card/90'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Timestamp on hover */}
                  <div className={`absolute -bottom-6 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    message.type === 'user' ? 'right-0' : 'left-0'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}
          
          {/* Spacer for better UX */}
          <div className="h-20" />
        </div>
      </ScrollArea>

      {/* Fixed input bar */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end gap-3 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-lg">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about your work sessions, productivity patterns, or anything else..."
                className="flex-1 bg-transparent resize-none border-none outline-none text-sm placeholder:text-muted-foreground/70 min-h-[20px] max-h-32 py-2"
                disabled={isLoading}
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-sm'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            
            {/* Subtle hint */}
            <p className="text-xs text-muted-foreground/60 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}