import { Link } from "react-router-dom";
import { ArrowLeft, Target } from "lucide-react";

export default function SpatialNavigator() {
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
            <Target className="w-5 h-5 text-green-500" />
            <h1 className="text-xl font-semibold">10x Your Focus with Spatial Navigator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Master Your Digital Workspace</h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Transform chaos into clarity with spatial organization that mirrors how your brain works.
          </p>

          <h3>What is Spatial Navigator?</h3>
          <p>
            Spatial Navigator lets you organize your apps, documents, and tools in 2D space, creating 
            visual relationships that make sense to you. Think of it as your digital desk that never gets messy.
          </p>

          <h3>Core Concepts</h3>
          <ul>
            <li><strong>Zones:</strong> Group related tools and documents together</li>
            <li><strong>Pathways:</strong> Create visual connections between related items</li>
            <li><strong>Context Switching:</strong> Smooth transitions between different work modes</li>
            <li><strong>Muscle Memory:</strong> Consistent placement builds automatic navigation</li>
          </ul>

          <h3>Best Practices</h3>
          <ol>
            <li><strong>Start Simple:</strong> Begin with 3-4 main zones (Deep Work, Communication, Research, etc.)</li>
            <li><strong>Group by Context:</strong> Place items you use together near each other</li>
            <li><strong>Use Visual Cues:</strong> Color-code different types of work</li>
            <li><strong>Regular Cleanup:</strong> Archive completed projects to keep space focused</li>
          </ol>

          <h3>Advanced Techniques</h3>
          <p>
            Once comfortable with basic spatial organization, try creating "workflow paths" - 
            predetermined routes through your workspace for common tasks like morning review, 
            deep work sessions, or project handoffs.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h4 className="text-foreground mb-3">🎯 Focus Tip</h4>
            <p className="text-muted-foreground mb-0">
              Keep your most distracting apps (social media, news) in a separate "break zone" 
              physically distant from your main work areas.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Link 
              to="/components/help/smart-launcher"
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Cortex Basics
            </Link>
            <Link 
              to="/components/help/data-tracking"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next: Data Tracking
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}