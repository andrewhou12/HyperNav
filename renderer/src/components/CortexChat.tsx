import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function CortexChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Cortex Intelligence, your AI assistant. I can help you understand your work sessions, analyze your productivity patterns, and answer questions about your past activities. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

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

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('session') || input.includes('today')) {
      return "Based on your current session, you've been working with Google Chrome (Gmail, GitHub, and Google Docs), Slack for team communication, VS Code for development, and various project files. Your session has been active for about 2 hours with high productivity in coding tasks.";
    }
    
    if (input.includes('productivity') || input.includes('performance')) {
      return "Your productivity patterns show peak focus hours between 9-11 AM and 2-4 PM. You tend to switch between applications every 12 minutes on average, with longer focus periods on coding tasks. Consider batching similar tasks to reduce context switching.";
    }
    
    if (input.includes('history') || input.includes('past') || input.includes('previous')) {
      return "Looking at your work history, you've completed 47 sessions this month with an average duration of 3.2 hours. Your most productive days are Tuesday and Wednesday. You frequently work with development tools, documentation, and communication platforms.";
    }
    
    if (input.includes('apps') || input.includes('applications')) {
      return "Your most used applications are VS Code (35% of time), Google Chrome (28%), Slack (15%), and various file management tools (22%). You have consistent patterns of using development and communication tools together.";
    }
    
    if (input.includes('suggest') || input.includes('recommend') || input.includes('improve')) {
      return "Based on your patterns, I recommend: 1) Block 90-minute focus sessions for deep work, 2) Use 'Do Not Disturb' mode during coding, 3) Schedule communication checks every 2 hours, and 4) Take breaks between context switches to maintain cognitive performance.";
    }
    
    return "I understand you're asking about your work patterns. I can help analyze your sessions, productivity trends, application usage, and provide personalized recommendations. Could you be more specific about what aspect you'd like to explore?";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      <img
  src="/icons/cortexlogov1invert.svg"
  alt="Cortex logo"
  className="w-6 h-6 object-contain"
/>
        <div>
          <h2 className="font-semibold text-foreground">Cortex Intelligence</h2>
          <p className="text-xs text-muted-foreground">AI Assistant for Work Analytics</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about your work sessions, productivity, or anything else..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="h-11 w-11 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}