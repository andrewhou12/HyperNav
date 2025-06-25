const { ipcMain } = require('electron');
const { saveSession, loadSession, updateSessionData, launchApp, startsession, pollActiveWindow, startPollingWindowState, stopPollingWindowState, sessionData } = require('./core/sessionManager');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');
const chromeDriver = require("./core/drivers/chromeDriver");

let sessionwin;


const appDrivers = {
  chrome: chromeDriver,
  // add vscode, terminal, etc.
};

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
        stopPollingWindowState();
    });
    

}


ipcMain.on('save-session', () => {
    saveSession();
    stopPollingWindowState();
    sessionwin.close();
  });
  
  ipcMain.handle('load-session', () => {
    return loadSession();
  });
  
  ipcMain.on('open-window', (_, type) => {
    if (type === 'start-session') {createSessionWindow();
    startsession();
    }

  
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
      type: "app_opened",
      name: appName,
      path: appPath,
      windowTitle: appName,
      isActive: true,
      addedAt: new Date().toISOString()
    };
  
    updateSessionData(newTab); // Save to session
    return newTab;
  });
  
  
  
  ipcMain.handle('launch-app', (_, appPath) => {
    launchApp(appPath);
  });


  ipcMain.handle("app-control", async (event, { app, action, payload }) => {
    const driver = appDrivers[app];
    
    if (driver && typeof driver[action] === "function") {
      try {
        await driver[action](payload); // don't return this!
  
        if (action === "openTab" || action === "launch") {
          updateSessionData({
            type: "app_opened",
            name: app,
            path: "/Applications/Google Chrome.app", // adjust if dynamic
            windowTitle: payload,
            isActive: true
          });
        }
  
        return; // <- return nothing (or true/null if needed)
      } catch (err) {
        console.error(`❌ Failed to perform ${action} on ${app}:`, err);
      }
    } else {
      console.error(`❌ Unknown app/action: ${app}/${action}`);
    }
  });
  
app.whenReady().then(() => {
  createWindow();
});
