
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthenticationPageProps {
  onSuccess: (userData: any) => void;
}

const AuthenticationPage: React.FC<AuthenticationPageProps> = ({ onSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - replace with Firebase Auth
    const userData = {
      email: formData.email,
      name: formData.email.split('@')[0],
      id: Math.random().toString(36).substr(2, 9)
    };
    onSuccess(userData);
  };

  const handleGoogleSignIn = () => {
    // Mock Google sign-in - replace with actual implementation
    const userData = {
      email: 'user@gmail.com',
      name: 'Google User',
      id: Math.random().toString(36).substr(2, 9)
    };
    onSuccess(userData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
      
      <div className="w-full max-w-md mx-auto">
        <div className="glass rounded-3xl p-8 space-y-8 animate-scale-in">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center p-2 mb-6">
              <img 
                src="/lovable-uploads/217235f9-296e-4613-9f8e-bed9993048df.png" 
                alt="Cortex Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignIn ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isSignIn 
                ? 'Sign in to access your Cortex workspace' 
                : 'Join thousands using Cortex to work smarter'
              }
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full glass-hover"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 glass-hover"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 glass-hover"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 glass-hover"
                      required={!isSignIn}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isSignIn ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center space-y-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full glass-hover"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? 'Create Account' : 'Sign In Instead'}
            </Button>
          </div>

          {/* Terms */}
          {!isSignIn && (
            <p className="text-center text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;