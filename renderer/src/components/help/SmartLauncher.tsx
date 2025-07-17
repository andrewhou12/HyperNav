import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function SmartLauncher() {
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
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-semibold">Intro to Cortex</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Welcome to Cortex Smart Launcher</h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Your intelligent productivity companion that adapts to how you work.
          </p>

          <h3>What is Smart Launcher?</h3>
          <p>
            Smart Launcher is the heart of your Cortex experience. It learns from your workflow patterns 
            and intelligently surfaces the right tools, files, and actions at the right moment.
          </p>

          <h3>Key Features</h3>
          <ul>
            <li><strong>Contextual App Suggestions:</strong> Based on your current task and time of day</li>
            <li><strong>Quick Access:</strong> Lightning-fast search and navigation</li>
            <li><strong>Workflow Memory:</strong> Remembers your most productive app combinations</li>
            <li><strong>Adaptive Interface:</strong> UI that evolves with your habits</li>
          </ul>

          <h3>Getting Started</h3>
          <p>
            Start by simply using Cortex naturally. The Smart Launcher will begin learning your patterns 
            within the first few sessions and gradually become more helpful as it understands your workflow.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h4 className="text-foreground mb-3">💡 Pro Tip</h4>
            <p className="text-muted-foreground mb-0">
              Use keyboard shortcuts (Cmd/Ctrl + K) to access the launcher quickly from anywhere in your workflow.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <div className="flex-1" />
            <Link 
              to="/components/help/spatial-navigator"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next: Spatial Navigator
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}