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
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import GoogleIcon from "../assets/google.svg"

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

  window.addEventListener("message", async (event) => {
    const { type, token } = event.data || {};
    if (type === "cortex:auth-token" && token) {
      console.log("✅ Received token in main app:", token);
      localStorage.setItem("authToken", token);
  
      // Optional: Use the token to authenticate Firebase session again
      const credential = GoogleAuthProvider.credential(null, token);
      await signInWithCredential(auth, credential);
  
      // Firebase state is now restored and onAuthStateChanged will fire
    }
  });

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
  
      if (!user) throw new Error("No user returned from Google sign-in");
  
      const idToken = await user.getIdToken();
      console.log("✅ Google sign-in successful, ID token:", idToken);
  
      // Send token to Electron if available
      if (window.electron?.sendAuthTokenToMain) {
        window.electron.sendAuthTokenToMain(idToken);
      }
  
      // Optionally store it in localStorage
      localStorage.setItem("authToken", idToken);
  
      setUser({ email: user.email || "", uid: user.uid });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("❌ Google Sign-in failed:", err);
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
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
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
