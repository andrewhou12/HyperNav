import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Settings, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MacPermissionsProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const MacPermissions: React.FC<MacPermissionsProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'permissions' | 'complete'>('intro');

  const permissions = [
    {
      icon: Eye,
      title: 'Accessibility',
      description: 'Allows Cortex to understand your screen context and provide intelligent suggestions',
      required: true
    },
    {
      icon: Settings,
      title: 'Automation',
      description: 'Enables smart workflows and seamless integration with your existing tools',
      required: true
    }
  ];

  const handleGrantPermissions = () => {
    // Step 1: trigger the native AppleScript prompt
    window.electron.triggerAutomationAndAccessibilityPrompt?.();
  
    // Step 2: show intermediate UI
    setCurrentStep('permissions');
  
    // Step 3: simulate waiting for user to complete permission grants
    setTimeout(() => {
      setCurrentStep('complete');
      setTimeout(onComplete, 1500);
    }, 2000);
  };

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="max-w-3xl mx-auto px-8 text-center space-y-8 mt-16" // <- added top margin
>
          {/* Header */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 mx-auto glass rounded-3xl flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold text-foreground"
            >
              Permission Required
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              To create your smart workspace layer, Cortex needs access to a few system permissions.
            </motion.p>
          </div>

          {/* Privacy assurance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Privacy First</span>
            </div>
            <p className="text-muted-foreground">
              All data stays on your device. We never store, transmit, or access your personal information. 
              Cortex processes everything locally to maintain your privacy and security.
            </p>
          </motion.div>

          {/* Permissions list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            {permissions.map((permission, index) => (
              <Card key={permission.title} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                      <permission.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{permission.title}</span>
                        {permission.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-left">
                    {permission.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center justify-center space-x-4 pt-4"
          >
            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="glass-hover"
              >
                Skip for Now
              </Button>
            )}
            <Button
              onClick={handleGrantPermissions}
              className="glass-hover"
              size="lg"
            >
              Grant Permissions
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'permissions') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto px-8 text-center space-y-8"
        >
          <div className="space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center"
            >
              <Settings className="w-8 h-8 text-primary" />
            </motion.div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Opening System Preferences
              </h2>
              <p className="text-muted-foreground">
                Please grant the requested permissions in the System Preferences window that just opened.
              </p>
            </div>

            <div className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Waiting for permissions...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This may take a few moments
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto px-8 text-center space-y-8"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-green-500" />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Permissions Granted
            </h2>
            <p className="text-muted-foreground">
              Your smart workspace layer is now ready to activate.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MacPermissions;