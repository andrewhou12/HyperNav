import React, { useState } from 'react';
import { CortexHUD } from '@/components/CortexHUD';
import { Toaster, toast } from 'react-hot-toast';


export default function HUD() {
    const [hudStatus, setHudStatus] = useState<'tracking' | 'alert' | 'idle'>('tracking');
    const [isSessionActive, setIsSessionActive] = useState(true);
    const [isCurrentAppInWorkspace, setIsCurrentAppInWorkspace] = useState(false);
    const [isHudVisible, setIsHudVisible] = useState(true);
  
    const statusMessages = {
      tracking: "Tracking current window",
      alert: "Current window not being tracked",
      idle: "Ready to track window"
    };

return (  

    <CortexHUD 
      isSessionActive={isSessionActive}
      isCurrentAppInWorkspace={isCurrentAppInWorkspace}
      currentApp="Chrome"
      statusMessage={statusMessages[hudStatus]}
      statusType={hudStatus}
      isVisible={isHudVisible}
      onVisibilityChange={setIsHudVisible}
    />
  )
}