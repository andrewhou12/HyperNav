const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  askGPT: (payload) => ipcRenderer.invoke('ask-gpt', payload),
  summarizeSession: (eventLog) => ipcRenderer.invoke('summarize-session', eventLog),
  interpretCommand: (command) => ipcRenderer.invoke('interpret-command', command),
  saveSession: () => ipcRenderer.invoke('save-session'),
  chooseApp: () => ipcRenderer.invoke('choose-app'),
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  smartLaunchApp: (app) => ipcRenderer.invoke('smart-launch-app', app),
  getRecentApps: () => ipcRenderer.invoke('get-recent-apps'),
  markAppUsed: (app) => ipcRenderer.invoke('mark-app-used', app),
  hideBackgroundApps: () => ipcRenderer.invoke('hide-background-apps'),
  showAllApps: () => ipcRenderer.invoke('show-all-apps'),
  startAutoHide: () => ipcRenderer.invoke('start-auto-hide'),
  stopAutoHide: () => ipcRenderer.invoke('stop-auto-hide'),
  pauseWorkspace: () => ipcRenderer.invoke('pause-workspace'),
  resumeWorkspace: () => ipcRenderer.invoke('resume-workspace'),
  clearWorkspace: () => ipcRenderer.invoke('clear-workspace'),
  openWindow: (type) => ipcRenderer.send('open-window', type),
  openChromeWithSearch: (query) => ipcRenderer.invoke('open-chrome-search', query),
  getAppIcon: (appPath) => ipcRenderer.invoke('get-app-icon', appPath),
  hideOverlay: (reason) => ipcRenderer.send('hide-overlay', { reason }),
  resizeHUDWindow: (size) => ipcRenderer.send('resize-hud-window', size),

  onLiveWorkspaceUpdate: (callback) => {
    ipcRenderer.on('live-workspace-update', (event, liveWorkspace) => {
      callback(liveWorkspace);
    });
  },
 

  getSessionData: () => ipcRenderer.invoke('get-session-data'),
  getLiveWorkspace: () => {
    console.log('🧠 preload: invoking get-live-workspace');
    return ipcRenderer.invoke('get-live-workspace');
  },
  onSessionLogEntry: (cb) => {
    ipcRenderer.on('session-log-entry', (_, entry) => cb(entry));
  },
  offSessionLogEntry: (cb) => {
    ipcRenderer.removeListener('session-log-entry', cb);
  },

  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    onShow: (cb) => ipcRenderer.on('show-overlay', (event, overlayType) => cb(event, overlayType)),
    onHide: (cb) => ipcRenderer.on('hide-overlay', () => cb()),
    removeShow: (cb) => ipcRenderer.removeListener('show-overlay', cb),
removeHide: (cb) => ipcRenderer.removeListener('hide-overlay', cb),
  },

});

contextBridge.exposeInMainWorld('cortexAPI', {
  appControl: (app, action, payload) => ipcRenderer.invoke('app-control', { app, action, payload }),
});
