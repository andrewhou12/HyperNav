const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // GPT and session APIs
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
  clearWorkspace: () => ipcRenderer.invoke('clear-workspace'),
  openWindow: (type) => ipcRenderer.send('open-window', type),

  // Live workspace updates
  onLiveWorkspaceUpdate: (callback) => {
    ipcRenderer.on('live-workspace-update', (event, liveWorkspace) => {
      callback(liveWorkspace);
    });
  },

  // Session log streaming
  getSessionData: () => ipcRenderer.invoke('get-session-data'),
  onSessionLogEntry: (cb) => {
    ipcRenderer.on('session-log-entry', (_, entry) => cb(entry));
  },
  offSessionLogEntry: (cb) => {
    ipcRenderer.removeListener('session-log-entry', cb);
  },

  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    onShow: (cb) => ipcRenderer.on('show-overlay', () => cb()),
    onHide: (cb) => ipcRenderer.on('hide-overlay', () => cb()),
  },

});

contextBridge.exposeInMainWorld('cortexAPI', {
  appControl: (app, action, payload) => ipcRenderer.invoke('app-control', { app, action, payload }),
});
