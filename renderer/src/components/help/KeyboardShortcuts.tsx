import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function KeyboardShortcuts() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            to="/session" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h1 className="text-xl font-semibold">Keyboard Shortcuts</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Work Faster with Hotkeys</h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Master these shortcuts to navigate Cortex at the speed of thought.
          </p>

          <h3>Global Shortcuts</h3>
          <div className="not-prose">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Open Smart Launcher</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ K</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Quick App Switcher</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Toggle AI Assistant</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ I</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Pause/Resume Session</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ P</kbd>
              </div>
            </div>
          </div>

          <h3>Spatial Navigator</h3>
          <div className="not-prose">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Pan workspace</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Space + Drag</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Zoom in/out</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ +/-</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Fit to screen</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ 0</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Create new zone</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ N</kbd>
              </div>
            </div>
          </div>

          <h3>AI Assistant</h3>
          <div className="not-prose">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Send message</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>New line in message</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Clear conversation</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ L</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Copy last response</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ C</kbd>
              </div>
            </div>
          </div>

          <h3>System & Navigation</h3>
          <div className="not-prose">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Toggle dark/light mode</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ D</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Open settings</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ ,</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Show/hide background apps</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">⌘ H</kbd>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h4 className="text-foreground mb-3">⚡ Pro Tip</h4>
            <p className="text-muted-foreground mb-0">
              Customize any shortcut in Settings → Keyboard. Create your own shortcuts for 
              frequently used actions to build your perfect workflow.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Link 
              to="/components/help/data-tracking"
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Data Tracking
            </Link>
            <Link 
              to="/components/help/ai-assistant"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next: AI Assistant
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}