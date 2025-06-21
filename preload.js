// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveSession: (data) => ipcRenderer.send('save-session', data),
  loadSession: () => ipcRenderer.invoke('load-session'),
  openWindow: (type) => ipcRenderer.send('open-window', type)
});

  

