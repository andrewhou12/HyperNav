// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveSession: (data) => ipcRenderer.send('save-session'),
  loadSession: () => ipcRenderer.invoke('load-session'),
  openWindow: (type) => ipcRenderer.send('open-window', type),
  updateSessionData: (tab) => ipcRenderer.send('update-session', tab),
  chooseApp: () => ipcRenderer.invoke('choose-app'),
  launchApp: (path) => ipcRenderer.invoke('launch-app', path),
  clearWorkspace: () => ipcRenderer.invoke("clear-workspace"),
  

  
});

contextBridge.exposeInMainWorld("cortexAPI", {
  appControl: (app, action, payload) =>
    ipcRenderer.invoke("app-control", { app, action, payload })
});



  

