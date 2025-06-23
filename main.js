const { ipcMain } = require('electron');
const { saveSession, loadSession, updateSessionData, launchApp, sessionData } = require('./core/sessionManager');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');


let sessionwin;

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
    sessionwin = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
    }
        
    })
    if (app.isPackaged) {
        sessionwin.loadFile(path.join(__dirname, '../renderer/dist/session.html'));
      } else {
        sessionwin.loadURL('http://localhost:5173/session.html'); // 👈 explicitly load session
      }

      sessionwin.on('closed', () => {
        sessionwin = null;
    });
    

}

ipcMain.on('save-session', () => {
    saveSession(sessionData);
    sessionwin.close();
  });
  
  ipcMain.handle('load-session', () => {
    return loadSession();
  });
  
  ipcMain.on('open-window', (_, type) => {
    if (type === 'start-session') createSessionWindow();
  
  });

  ipcMain.on('update-session', (event, tab) => {
    updateSessionData(tab);
  });

  ipcMain.handle('choose-app', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choose an App',
      defaultPath: '/Applications',
      properties: ['openFile', 'dontAddToRecent'],
    });
  
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
  
    const appPath = result.filePaths[0];
  
    // ✅ Ensure it's a real `.app` bundle
    if (!appPath.endsWith('.app')) {
      console.error("❌ Selected file is not a .app bundle");
      return null;
    }
  
    const appName = appPath.split('/').pop().replace('.app', '');
  
    const newTab = {
      type: "app",
      name: appName,
      path: appPath,
      windowTitle: appName,
      isActive: true
    };
  
    updateSessionData(newTab); // Save to session
    return newTab;
  });
  
  
  
  ipcMain.handle('launch-app', (_, appPath) => {
    launchApp(appPath);
  });

app.whenReady().then(() => {
  createWindow();
});
