import { Link } from "react-router-dom";
import { ArrowLeft, Brain } from "lucide-react";

export default function AIAssistant() {
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
            <Brain className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-semibold">AI Assistant Tips</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Get the Most from Cortex Intelligence</h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Your AI companion understands your work context and can help in ways you might not expect.
          </p>

          <h3>Best Conversation Starters</h3>
          <div className="not-prose mb-6">
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-1">"What should I focus on today?"</div>
                <div className="text-sm text-muted-foreground">Gets personalized recommendations based on your calendar and current projects</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-1">"I'm feeling scattered, help me organize"</div>
                <div className="text-sm text-muted-foreground">Provides workflow optimization suggestions</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-1">"Summarize my productivity this week"</div>
                <div className="text-sm text-muted-foreground">Generates insights from your usage patterns</div>
              </div>
            </div>
          </div>

          <h3>Context Awareness</h3>
          <p>
            The AI assistant knows about your current session, open applications, recent activity, 
            and workspace organization. This means you can ask questions like:
          </p>
          <ul>
            <li>"Why do I keep getting distracted by email?"</li>
            <li>"What's the best time for me to do deep work?"</li>
            <li>"Should I reorganize my workspace?"</li>
            <li>"When did I last work on project X?"</li>
          </ul>

          <h3>Productivity Coaching</h3>
          <p>
            Beyond answering questions, your AI assistant can provide proactive coaching:
          </p>
          <ul>
            <li><strong>Energy Management:</strong> Suggests optimal times for different types of work</li>
            <li><strong>Break Reminders:</strong> Notices when you need a mental reset</li>
            <li><strong>Focus Sessions:</strong> Helps design distraction-free work periods</li>
            <li><strong>Weekly Reviews:</strong> Guides reflection on what's working and what isn't</li>
          </ul>

          <h3>Advanced Features</h3>
          
          <h4>Project Context</h4>
          <p>
            Tell the AI about your current projects, and it can help track progress, 
            suggest next steps, and remind you of important deadlines.
          </p>

          <h4>Learning Style Adaptation</h4>
          <p>
            The more you interact, the better the AI understands your communication style, 
            preferred level of detail, and types of suggestions that work best for you.
          </p>

          <h4>Integration Suggestions</h4>
          <p>
            Based on your workflow patterns, the AI can recommend new tools, shortcuts, 
            or organizational methods that might improve your productivity.
          </p>

          <h3>Privacy & Learning</h3>
          <p>
            The AI learns from your interactions but never shares personal information. 
            All conversations and insights remain private to your device unless you 
            explicitly choose to sync them.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h4 className="text-foreground mb-3">🧠 Advanced Tip</h4>
            <p className="text-muted-foreground mb-0">
              Try having a weekly "reflection conversation" with your AI assistant. 
              Ask it to analyze your week and suggest improvements - you might be surprised 
              by the patterns it notices that you missed.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Link 
              to="/components/help/keyboard-shortcuts"
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Keyboard Shortcuts
            </Link>
            <div className="flex-1" />
          </div>
        </div>
      </main>
    </div>
  );
}