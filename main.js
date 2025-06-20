const { ipcMain } = require('electron');
const { saveSession, loadSession } = require('./core/sessionManager');
const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  
  win.loadURL('http://localhost:5173');
}

ipcMain.on('save-session', (event, sessionData) => {
    saveSession(sessionData);
  });
  
  ipcMain.handle('load-session', () => {
    return loadSession();
  });
  

app.whenReady().then(() => {
  createWindow();
});
