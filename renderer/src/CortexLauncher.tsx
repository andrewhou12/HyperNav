import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, FolderOpen, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Real-time Clock Component
const LiveClock = ({ className = "" }: { className?: string }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`font-mono text-muted-foreground/80 ${className}`}>
      <div className="text-sm tracking-wide flex items-center gap-2">
        <span>{formatDate(time)}</span>
        <span>•</span>
        <span>{formatTime(time)}</span>
      </div>
    </div>
  );
};

export function CortexLauncher() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleStartSession = () => {
    setIsLoading('start');
    window.electron.openWindow("start-session");
    setTimeout(() => setIsLoading(null), 1000);
  };

  const handleLoadSession = async () => {
    setIsLoading('load');
    const session = await window.electron.loadSession();
    console.log("Loaded session:", session);
    setTimeout(() => setIsLoading(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-primary/[0.03] to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between animate-fade-in">
        <div className="flex items-center group cursor-pointer">
          <img 
            src="/icons/cortexlogov1invert.svg"
            alt="Cortex Logo" 
            className="w-12 h-12 transition-all duration-300 group-hover:scale-110 drop-shadow-sm"
          />
          <div className="ml-3 hidden sm:block">
            <h1 className="text-xl font-bold text-foreground">Cortex</h1>
            <p className="text-xs text-muted-foreground">Intelligent Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LiveClock className="hidden sm:block" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-muted/50 transition-all duration-300 hover:scale-105">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Avatar className="w-9 h-9 ring-2 ring-border/50 hover:ring-primary/30 transition-all duration-300 cursor-pointer">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 w-full max-w-lg animate-fade-in relative">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
              Welcome to Cortex
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Great Work Awaits
            </p>

            <div className="space-y-4">
              <Button 
                onClick={handleStartSession}
                disabled={isLoading !== null}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-glow-pulse" />
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading === 'start' ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-lg">Initializing Session...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span className="text-lg">Start New Session</span>
                    </>
                  )}
                </div>
              </Button>

              <Button 
                onClick={handleLoadSession}
                disabled={isLoading !== null}
                variant="outline"
                className="w-full h-12 glass-hover border-border/50 text-foreground font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:bg-muted hover:text-muted-foreground"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading === 'load' ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>Loading Session...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4" />
                      <span>Load Previous Session</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-muted/50 rounded text-xs">⌘</kbd>
            <span>+</span>
            <kbd className="px-2 py-0.5 bg-muted/50 rounded text-xs">Space</kbd>
            <span>Quick Launch</span>
          </span>
          <span className="hidden md:block">•</span>
          <span>Ready to begin your journey</span>
        </div>
      </footer>
    </div>
  );
}
