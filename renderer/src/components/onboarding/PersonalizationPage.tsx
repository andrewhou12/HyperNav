
import React, { useState } from 'react';
import { Palette, Code, MessageSquare, Calendar, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonalizationPageProps {
  onComplete: () => void;
  onSkip: () => void;
}

const focusModes = [
  { id: 'creative', name: 'Creative Work', icon: Palette, description: 'Design, writing, and creative tasks' },
  { id: 'development', name: 'Development', icon: Code, description: 'Coding and technical projects' },
  { id: 'communication', name: 'Communication', icon: MessageSquare, description: 'Meetings, emails, and collaboration' },
  { id: 'planning', name: 'Project Management', icon: Calendar, description: 'Planning, organizing, and tracking' },
];

const favoriteApps = [
  { id: 'chrome', name: 'Chrome', color: 'bg-red-500' },
  { id: 'vscode', name: 'VS Code', color: 'bg-blue-500' },
  { id: 'slack', name: 'Slack', color: 'bg-purple-500' },
  { id: 'figma', name: 'Figma', color: 'bg-orange-500' },
  { id: 'notion', name: 'Notion', color: 'bg-gray-500' },
  { id: 'spotify', name: 'Spotify', color: 'bg-green-500' },
];

const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ onComplete, onSkip }) => {
  const [selectedFocusMode, setSelectedFocusMode] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const toggleApp = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleComplete = () => {
    // Save preferences
    const preferences = {
      focusMode: selectedFocusMode,
      favoriteApps: selectedApps
    };
    console.log('User preferences:', preferences);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-4xl mx-auto animate-slide-up">
        <div className="glass rounded-3xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Personalize Your Workspace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us set up Cortex to match your workflow and boost your productivity.
            </p>
          </div>

          {/* Focus Mode Selection */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Choose your primary focus mode:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedFocusMode(mode.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left glass-hover ${
                    selectedFocusMode === mode.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-card'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedFocusMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <mode.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {mode.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Apps Selection */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Select your favorite apps (optional):
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {favoriteApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center glass-hover ${
                    selectedApps.includes(app.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-card'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl ${app.color} flex items-center justify-center mb-2`}>
                    <span className="text-white font-bold text-sm">
                      {app.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {app.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="glass-hover"
            >
              <X className="w-4 h-4 mr-2" />
              Skip for now
            </Button>

            <Button
              onClick={handleComplete}
              disabled={!selectedFocusMode}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;