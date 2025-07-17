import { Link } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";

export default function DataTracking() {
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
            <Activity className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-semibold">What Cortex Tracks & Why</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Understanding Your Productivity Data</h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Transparency into what Cortex observes and how it helps you work better.
          </p>

          <h3>What We Track</h3>
          
          <h4>Application Usage</h4>
          <ul>
            <li>Which apps you open and when</li>
            <li>Time spent in each application</li>
            <li>Switching patterns between tools</li>
            <li>Most productive app combinations</li>
          </ul>

          <h4>Workflow Patterns</h4>
          <ul>
            <li>Peak productivity hours</li>
            <li>Common task sequences</li>
            <li>Break patterns and duration</li>
            <li>Context switching frequency</li>
          </ul>

          <h4>Spatial Organization</h4>
          <ul>
            <li>How you organize your workspace</li>
            <li>Most accessed areas</li>
            <li>Navigation paths through your setup</li>
            <li>Zone usage patterns</li>
          </ul>

          <h3>Why We Track This</h3>
          
          <h4>Personalized Insights</h4>
          <p>
            By understanding your unique work patterns, Cortex can provide tailored suggestions 
            for when to take breaks, which tools to use for specific tasks, and how to optimize your setup.
          </p>

          <h4>Predictive Assistance</h4>
          <p>
            Pattern recognition allows Cortex to anticipate your needs - suggesting the right app 
            before you think to open it, or preparing your workspace for your next scheduled task.
          </p>

          <h4>Productivity Optimization</h4>
          <p>
            Data helps identify bottlenecks, distractions, and opportunities for improvement in your workflow.
          </p>

          <h3>Your Privacy</h3>
          <ul>
            <li><strong>Local First:</strong> All data stays on your device by default</li>
            <li><strong>No Content Reading:</strong> We track usage patterns, not what you type or view</li>
            <li><strong>Opt-in Sync:</strong> Cloud features require explicit permission</li>
            <li><strong>Full Control:</strong> Export or delete your data anytime</li>
          </ul>

          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h4 className="text-foreground mb-3">🔒 Privacy Promise</h4>
            <p className="text-muted-foreground mb-0">
              Your productivity data belongs to you. Cortex is designed to help you understand 
              your own patterns, not to share them with anyone else.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Link 
              to="/components/help/spatial-navigator"
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Spatial Navigator
            </Link>
            <Link 
              to="/components/help/keyboard-shortcuts"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next: Keyboard Shortcuts
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}