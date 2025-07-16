import React, { useEffect, useState } from 'react';
import { CortexHUD } from '@/components/CortexHUD';
import { Toaster, toast } from 'react-hot-toast';

export default function HUD() {
  const [hudStatus, setHudStatus] = useState<'tracking' | 'alert' | 'idle'>('tracking');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isCurrentAppInWorkspace, setIsCurrentAppInWorkspace] = useState(false);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [currentApp, setCurrentApp] = useState('Unknown');
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);

  const statusMessages = {
    tracking: "Tracking current window",
    alert: "Current window not being tracked",
    idle: "Ready to track window"
  };

  useEffect(() => {
    const unsubscribe = window.electron.onLiveWorkspaceUpdate?.((workspace) => {
      const focused = workspace?.lastFocusedWindow;
      if (!focused) return;
  
      console.log("📥 HUD received update:", focused);
      console.log("🔍 Looking for appId:", focused.appId);
      console.log("🔍 Available apps:", workspace.apps?.map(app => ({ id: app.id, name: app.name })));
  
      setCurrentApp(focused.appName || 'Unknown');
      setCurrentAppId(focused.appId || null);
  
      const inWorkspace = !!workspace.apps?.some(app => app.id === focused.appId);
      console.log("🔍 Is in workspace?", inWorkspace);
      setIsCurrentAppInWorkspace(inWorkspace);
    });
  
    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleToggleSession = async () => {
    try {
      if (isSessionActive) {
        await window.electron.pauseWorkspace?.();
        toast.success('Session paused');
      } else {
        await window.electron.resumeWorkspace?.();
        toast.success('Session resumed');
      }
      setIsSessionActive(prev => !prev);
    } catch (err) {
      toast.error('Failed to toggle session');
      console.error(err);
    }
  };

  const handleGoToDashboard = async () => {
    try {
      await window.electron.openDashboard?.();
    } catch (err) {
      toast.error('Failed to open dashboard');
      console.error(err);
    }
  };

  const handleToggleWorkspaceApp = async () => {
    if (!currentAppId) {
      toast.error('No app ID available');
      return;
    }

    try {
      if (isCurrentAppInWorkspace) {
        await window.electron.removeAppFromWorkspace?.(currentAppId);
        toast.success(`${currentApp} removed from workspace`);
        setIsCurrentAppInWorkspace(false);
      } else {
        await window.electron.addAppToWorkspace?.(currentAppId);
        toast.success(`${currentApp} added to workspace`);
        setIsCurrentAppInWorkspace(true);
      }
    } catch (err) {
      toast.error('Failed to update workspace');
      console.error(err);
    }
  };

  const handleActivateOverlay = async (type: 'navigator' | 'gpt' | 'utilities' | 'launcher') => {
    try {
      switch (type) {
        case 'navigator':
          await window.electron.openSpatialNavigator?.();
          break;
        case 'gpt':
          await window.electron.openInlineGPT?.();
          break;
        case 'utilities':
          await window.electron.openUtilitiesOverlay?.();
          break;
        case 'launcher':
          await window.electron.openSmartLauncher?.();
          break;
      }
    } catch (err) {
      toast.error(`Failed to open ${type}`);
      console.error(err);
    }
  };

  return (
    <>
      <CortexHUD
        isSessionActive={isSessionActive}
        isCurrentAppInWorkspace={isCurrentAppInWorkspace}
        currentApp={currentApp}
        statusMessage={statusMessages[hudStatus]}
        statusType={hudStatus}
        isVisible={isHudVisible}
        onVisibilityChange={setIsHudVisible}
        onToggleSession={handleToggleSession}
        onGoToDashboard={handleGoToDashboard}
        onToggleWorkspaceApp={handleToggleWorkspaceApp}
        onActivateOverlay={handleActivateOverlay}
      />
      <Toaster />
    </>
  );
}
