import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthenticationPageProps {
  onSuccess: (userData: any) => void;
}

const AuthenticationPage: React.FC<AuthenticationPageProps> = ({ onSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleHostedLogin = () => {
    setLoading(true);
    window.electron?.startHostedLogin();
  };

  useEffect(() => {
    const listener = (token: string) => {
      if (!token || typeof token !== 'string') {
        console.error('❌ Invalid token received from main process:', token);
        alert('Login failed: invalid token');
        setLoading(false);
        return;
      }
    
      console.log('✅ Received auth token from main process:', token);
      localStorage.setItem('authToken', token);
    
      let decoded: any = {};
      try {
        decoded = JSON.parse(atob(token.split('.')[1]));
      } catch (err) {
        console.warn('⚠️ Could not decode token payload:', err);
      }
    
      onSuccess({
        token,
        email: decoded.email ?? 'unknown',
        uid: decoded.user_id ?? 'unknown',
        name: decoded.name ?? 'Cortex User',
      });
    
      setLoading(false);
    };

    const unsubscribe = window.electron?.onAuthSuccess(listener);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
      
      <div className="w-full max-w-md mx-auto">
        <div className="glass rounded-3xl p-8 space-y-8 animate-scale-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center mb-6">
              <img 
                src="./icons/cortexlogov3.svg"
                alt="Cortex Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sign In to Cortex
            </h1>
            <p className="text-muted-foreground">
              Continue with your Google account or email
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full glass-hover"
            onClick={handleHostedLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Launching Login...' : 'Continue with Google or Email'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">via Hosted Login</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full glass-hover"
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn ? 'New? Create an Account' : 'Have an Account? Sign In'}
          </Button>

          {isSignIn === false && (
            <p className="text-center text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
