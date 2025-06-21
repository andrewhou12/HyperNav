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

  
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173/index.html'); // 👈 explicitly load index
  }
}

function createSessionWindow () {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
    }
        
    })
    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, '../renderer/dist/session.html'));
      } else {
        win.loadURL('http://localhost:5173/session.html'); // 👈 explicitly load session
      }

}

ipcMain.on('save-session', (event, sessionData) => {
    saveSession(sessionData);
  });
  
  ipcMain.handle('load-session', () => {
    return loadSession();
  });
  
  ipcMain.on('open-window', (_, type) => {
    if (type === 'start-session') createSessionWindow();
  
  });
  

app.whenReady().then(() => {
  createWindow();
});
