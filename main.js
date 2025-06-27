const { ipcMain } = require('electron');
const { isAppInWorkspace, saveSession, loadSession, updateSessionData, launchApp, startsession, pollActiveWindow, startPollingWindowState, stopPollingWindowState, sessionData } = require('./core/sessionManager');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');
const chromeDriver = require("./core/drivers/chromeDriver");
const { chromeSessionProfile } = require("./core/drivers/chromeDriver");
const { clearWorkspace } = require("./core/workspaceManager");
const { screen } = require("electron");
const { toggleDockAutohide } = require("./core/systemUIManager");
const { getPreviouslyHiddenApps } = require("./core/workspaceManager");
const { showApps } = require("./utils/applescript");
const fs = require("fs");
const { exec } = require("child_process");



let sessionwin;


const appDrivers = {
  chrome: chromeDriver,
  vscode: require("./core/drivers/vscode")
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
      frame: false, // 🔥 removes OS window chrome
      transparent: false, // (keep true if you want a see-through effect)
      titleBarStyle: "hiddenInset", // macOS: hides the native title bar cleanly
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
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
        toggleDockAutohide(false);
       
        const previouslyHidden = getPreviouslyHiddenApps();
        if (previouslyHidden?.length) {
          showApps(previouslyHidden);
        }

        

        exec(`osascript -e 'tell application "Google Chrome" to quit'`, (err) => {
          if (err) {
            console.error("❌ Failed to quit Chrome:", err.message);
          } else {
            console.log("🧼 Chrome instance quit successfully.");
      
          }
        });
        
    });
    

}
function expandAndCenterSessionWindow(win) {
  const display = screen.getPrimaryDisplay();
  const bounds = display.bounds; // full screen area, including Dock space

  win.setBounds({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  });

  win.center();
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
        // 🧠 Smart Chrome handler
        if (app === "chrome" && action === "openTab") {
          if (!isAppInWorkspace("Google Chrome")) {
            console.log("🔍 Chrome not in workspace — launching new window");
            await driver.openNewWindowWithTab(payload);
          } else {
            console.log("🔍 Chrome already in workspace — opening new tab");
            await driver.openTab(payload);
          }
  
          updateSessionData({
            type: "app_opened",
            name: app,
            path: "/Applications/Google Chrome.app",
            windowTitle: payload,
            isActive: true
          });
  
          return;
        }
  
        // 🧩 Default behavior
        await driver[action](payload);
  
        if (["openTab", "launch", "openNewWindowWithTab"].includes(action)) {
          updateSessionData({
            type: "app_opened",
            name: app,
            path: "/Applications/Google Chrome.app",
            windowTitle: payload,
            isActive: true
          });
        }
  
        return;
      } catch (err) {
        console.error(`❌ Failed to perform ${action} on ${app}:`, err);
      }
    } else {
      console.error(`❌ Unknown app/action: ${app}/${action}`);
    }
  });
  

ipcMain.handle("clear-workspace", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const hiddenApps = await clearWorkspace();
  await toggleDockAutohide(true);
  
  setTimeout(() => {
    expandAndCenterSessionWindow(win);
  }, 2000);

  updateSessionData({
    type: "workspace_cleared",
    items: hiddenApps,
  });

  
  return "Workspace cleared and expanded.";
});

  
app.whenReady().then(() => {
  createWindow();
});
