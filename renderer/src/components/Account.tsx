import { useState, useEffect } from "react";
import { User, LogOut, Download, Trash2, Settings, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({ email: user.email || "", uid: user.uid });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);

    try {
      const method = isCreatingAccount
        ? createUserWithEmailAndPassword
        : signInWithEmailAndPassword;
      const userCredential = await method(auth, email.trim(), password.trim());
      const user = userCredential.user;
      setUser({ email: user.email || "", uid: user.uid });
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      alert(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser({ email: user.email || "", uid: user.uid });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Google Sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = () => {
    onExportData?.();
    const data = {
      user,
      exportDate: new Date().toISOString(),
      sessions: [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortex-export-${new Date().toISOString().split("T")[0]}.json`;
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
  className="relative w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 p-0"
>
  <User className="w-4 h-4 mx-auto my-auto" />
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
                  <Badge variant="secondary" className="text-xs bg-primary text-white">
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
                <CardDescription>Not signed in</CardDescription>
              )}
            </CardHeader>

            <CardContent className="pt-0 space-y-1">
              {!user ? (
                <Button
                  onClick={() => {
                    setIsCreatingAccount(false);
                    setIsModalOpen(true);
                  }}
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
                 className="w-full justify-start text hover:text-destructive"
                  variant="ghost"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Session Data
              </Button>

              <Button
                onClick={handleDeleteData}
                 className="w-full justify-start text hover:text-destructive"
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

      {/* Auth Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreatingAccount ? "Create Account" : "Connect Account"}</DialogTitle>
            <DialogDescription>
              {isCreatingAccount
                ? "Create a new Cortex account to sync your workspace."
                : "Sign in to your Cortex account to enable sync and cloud features."}
            </DialogDescription>
          </DialogHeader>
          
          <Button
  type="button"
  variant="outline"
  onClick={handleGoogleSignIn}
  disabled={isSubmitting}
  className="w-full flex items-center justify-center gap-2"
>
  <img src="/icons/google.svg" alt="Google" className="w-4 h-4" />
  {isSubmitting ? "Signing in..." : "Continue with Google"}
</Button>

<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-muted" />
  </div>
  <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
    <span className="bg-background px-2">Or</span>
  </div>
</div>



          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !email.trim()} className="flex-1">
                {isSubmitting
                  ? isCreatingAccount
                    ? "Creating..."
                    : "Connecting..."
                  : isCreatingAccount
                  ? "Create"
                  : "Connect"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground text-center pt-3 border-t">
            {isCreatingAccount ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsCreatingAccount(false)}
                  className="underline text-foreground hover:text-primary"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsCreatingAccount(true)}
                  className="underline text-foreground hover:text-primary"
                >
                  Create One
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
