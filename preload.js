const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  askGPT: (payload) => ipcRenderer.invoke('ask-gpt', payload),
  summarizeSession: (eventLog) => ipcRenderer.invoke('summarize-session', eventLog),
  interpretCommand: (command) => ipcRenderer.invoke('interpret-command', command),
  saveSession: () => ipcRenderer.invoke('save-session'),
  chooseApp: () => ipcRenderer.invoke('choose-app'),
  launchApp: (appPath) => ipcRenderer.invoke('launch-app', appPath),
  hideBackgroundApps: () => ipcRenderer.invoke('hide-background-apps'),
  showAllApps: () => ipcRenderer.invoke('show-all-apps'),
  startAutoHide: () => ipcRenderer.invoke('start-auto-hide'),
  stopAutoHide: () => ipcRenderer.invoke('stop-auto-hide'),
  pauseWorkspace: () => ipcRenderer.invoke('pause-workspace'),
  resumeWorkspace: () => ipcRenderer.invoke('resume-workspace'),
  openWindow: (type) => ipcRenderer.send('open-window', type),
  onLiveWorkspaceUpdate: (callback) => {
    ipcRenderer.on('live-workspace-update', (event, liveWorkspace) => {
      callback(liveWorkspace);
    });
  },
  
});

contextBridge.exposeInMainWorld('cortexAPI', {
  appControl: (app, action, payload) => ipcRenderer.invoke('app-control', { app, action, payload }),
});
  

