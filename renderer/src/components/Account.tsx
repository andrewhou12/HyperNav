import { useState, useEffect } from "react";
import { User, LogOut, Download, Trash2, Settings, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface CortexUser {
  email: string;
  uid: string;
}

interface AccountProps {
  onExportData?: () => void;
  onDeleteData?: () => void;
}

export function Account({ onExportData, onDeleteData }: AccountProps) {
  const [user, setUser] = useState<CortexUser | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("cortexUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("cortexUser");
      }
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: CortexUser = {
      email: email.trim(),
      uid: `mock-uid-${Date.now()}`
    };

    localStorage.setItem("cortexUser", JSON.stringify(newUser));
    setUser(newUser);
    setEmail("");
    setIsSignInModalOpen(false);
    setIsSubmitting(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("cortexUser");
    setUser(null);
  };

  const handleExportData = () => {
    onExportData?.();
    // Default export implementation
    const data = {
      user: user,
      exportDate: new Date().toISOString(),
      sessions: [] // Would contain actual session data
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortex-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (confirm("Are you sure you want to delete all local data? This action cannot be undone.")) {
      localStorage.clear();
      setUser(null);
      onDeleteData?.();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="relative p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200"
          >
            <User className="w-4 h-4" />
            {user && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Account</CardTitle>
                {user ? (
                  <Badge variant="secondary" className="text-xs">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Local user
                  </Badge>
                )}
              </div>
              
              {user ? (
                <CardDescription className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </CardDescription>
              ) : (
                <CardDescription>
                  Not signed in
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="pt-0 space-y-1">
              {!user ? (
                <Button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className="w-full justify-start hover:bg-primary focus:bg-primary"

                  variant="ghost"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              ) : (
                <Button 
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive"
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
              
              <DropdownMenuSeparator />
              
              <Button 
                onClick={handleExportData}
                className="w-full justify-start hover:bg-primary focus:bg-primary"
                variant="ghost"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Session Data
              </Button>
              
              <Button 
                onClick={handleDeleteData}
                className="w-full justify-start hover:bg-primary focus:bg-primary"
                variant="ghost"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Local Data
              </Button>
            </CardContent>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sign In Modal */}
      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Account</DialogTitle>
            <DialogDescription>
              Enter your email to connect your Cortex account. This will enable sync and cloud features.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSignInModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !email.trim()}
                className="flex-1"
              >
                {isSubmitting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </form>
          
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            This is a mock sign-in for demonstration. No real authentication is performed.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}