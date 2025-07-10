const path = require('path');
const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog } = require('electron');
const { exec } = require('child_process');
require('dotenv').config();

// Session manager exports
const {
  getSessionData,
  isAppInWorkspace,
  saveSession,
  loadSession,
  updateSessionData,
  launchApp,
  startSession,
  stopPollingWindowState
} = require('./core/sessionManager');

const {
  clearWorkspace,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace
} = require('./core/workspaceManager');

const chromeDriver = require('./core/drivers/chromeDriver');
const vscodeDriver = require('./core/drivers/vscode');
const workspaceManager = require('./core/workspaceManager');
const { toggleDockAutohide } = require('./core/systemUIManager');
const { showApps } = require('./utils/applescript');
const sessionManager = require('./core/sessionManager');

app.setName("Cortex");
let hotkeysEnabled = false;
let overlayWindow;
let launcherWindow;
let sessionWindow;
let overlayOpenedFromGlobal = false;

const appDrivers = { chrome: chromeDriver, vscode: vscodeDriver };

const iconPath = path.resolve(
  app.getAppPath(),
  'renderer',
  'public',
  'icons',
  'cortexlogov1.icns'
);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL('http://localhost:5173/');

  win.on('closed', () => {
    launcherWindow = null;
  });
  
  launcherWindow = win;
}

function createSessionWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  const win = new BrowserWindow({
    title: "Cortex",
    icon: iconPath,
    frame: false,
    show: false,
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL('http://localhost:5173/session');

  win.on('close', async (e) => {
    e.preventDefault();
    await saveSession();
    stopPollingWindowState();
    unregisterHotkeys();
    workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
    win.destroy();
    sessionWindow = null;
  });

  win.on('closed', () => {
    toggleDockAutohide(false);
    if (workspaceManager.getPreviouslyHiddenApps) {
      const previouslyHidden = workspaceManager.getPreviouslyHiddenApps();
      if (previouslyHidden?.length) showApps(previouslyHidden);
    }
    const sessionData = getSessionData();
    const wasChromeTracked = sessionData?.liveWorkspace?.apps?.some(
      app => app.name.toLowerCase() === "google chrome"
    );
    if (wasChromeTracked) {
      exec(
        `osascript -e 'tell application "Google Chrome" to quit'`,
        (err) => {
          if (err) console.error("❌ Chrome quit failed:", err.message);
          else console.log("🧼 Chrome instance quit successfully.");
        }
      );
    }
    
    createWindow(); //reopen launcher on close

  });

  win.on('focus', () => {
    unregisterHotkeys();
  });

  win.on('blur', () => {
    registerHotkeys();
  });

  
  sessionWindow = win;



  return win;
}

function createOverlayWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  
  const panelWidth  = 896;
  const panelHeight = 860;

  overlayWindow = new BrowserWindow({
    x: Math.round((bounds.width  - panelWidth ) / 2),
    y: Math.round((bounds.height - panelHeight) / 2),
    width: panelWidth,
    height: panelHeight,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    thickFrame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,  // you could set this to true if you want window resize handles (optional)
    alwaysOnTop: true,
    skipTaskbar: true,
    movable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
    }
  });

  overlayWindow.loadURL('http://localhost:5173/overlay');
  overlayWindow.hide();
  
  overlayWindow.on('blur', () => {
    if (!overlayWindow.isDestroyed()) {
      overlayWindow.hide();
    }
  });
  overlayWindow.on('show', () => {
    overlayWindow.webContents.send('show-overlay');
  });
  overlayWindow.on('hide', () => {
    overlayWindow.webContents.send('hide-overlay');
  });
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function registerHotkeys() {
  if (hotkeysEnabled) return;
  hotkeysEnabled = true;

  globalShortcut.register('Option+Tab', () => {
    if (overlayWindow?.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayOpenedFromGlobal = true;
  
      // Immediately hide any other Electron windows:
      if (launcherWindow?.isVisible()) launcherWindow.hide();
      if (sessionWindow?.isVisible()) sessionWindow.hide();
  
      overlayWindow.show();
    }
  });

  globalShortcut.register('Option+Space', () => { //theoretical for now
    // if (aiWindow?.isVisible()) {
    //   aiWindow.hide();
    // } else {
    //   aiOpenedFromGlobal = true;  
    //   aiWindow.show();
    //  
    // }
  });
}

function unregisterHotkeys() {
  if (!hotkeysEnabled) return;
  hotkeysEnabled = false;
  globalShortcut.unregisterAll();
}

async function startCortexSession() {
  const hiddenApps = await clearWorkspace();
  toggleDockAutohide(true);

  const sessionwin = createSessionWindow();
  sessionwin.once('ready-to-show', () => {
    setTimeout(() => {
      sessionwin.maximize();
      sessionwin.show();

      if (launcherWindow && !launcherWindow.isDestroyed()) {//wait for session to start before hiding launcher window
        launcherWindow.close();
        launcherWindow = null;
      }


    }, 2000);//this shit is buggy as hell, we need to add a timer to wait for everything to hide properly. should refactor this because it's very hacky.

    sessionManager.setMainWindow(sessionwin);
    startSession();
    startAutoHide();
    createOverlayWindow();
  });

  updateSessionData({ type: 'workspace_cleared', items: hiddenApps });
  registerHotkeys();
}

ipcMain.handle('save-session', async () => {
  await saveSession();
  stopPollingWindowState();
  workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
  sessionWindow.close();
  return { ok: true };
});

ipcMain.handle('load-session', () => loadSession());
ipcMain.on('open-window', async (_, type) => {
  if (type === 'start-session') await startCortexSession();
});
ipcMain.on('update-session', (_, tab) => updateSessionData(tab));
ipcMain.handle('choose-app', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose an App',
    defaultPath: '/Applications',
    properties: ['openFile', 'dontAddToRecent'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const appPath = result.filePaths[0];
  if (!appPath.endsWith('.app')) return null;
  const appName = path.basename(appPath, '.app');
  const newTab = {
    type: 'app_opened',
    name: appName,
    path: appPath,
    windowTitle: appName,
    isActive: true,
    addedAt: new Date().toISOString(),
    launchedViaCortex: true
  };
  updateSessionData(newTab);
  return newTab;
});

ipcMain.handle('launch-app', (_, appPath) => launchApp(appPath));
ipcMain.handle('app-control', async (_, { app, action, payload }) => {
  const driver = appDrivers[app];
  if (driver?.[action] instanceof Function) {
    try {
      if (app === 'chrome' && action === 'openTab') {
        if (!isAppInWorkspace('Google Chrome'))
          await driver.openNewWindowWithTab(payload);
        else await driver.openTab(payload);
        updateSessionData({
          type: 'app_opened',
          name: 'Google Chrome',
          path: '/Applications/Google Chrome.app',
          windowTitle: payload,
          isActive: true,
          launchedViaCortex: true
        });
        return;
      }
      await driver[action](payload);
      if (['openTab', 'launch', 'openNewWindowWithTab'].includes(action)) {
        updateSessionData({
          type: 'app_opened',
          name: app,
          path: '/Applications/Google Chrome.app',
          windowTitle: payload,
          isActive: true,
          launchedViaCortex: true
        });
      }
    } catch (err) {
      console.error(`❌ Failed to perform ${action} on ${app}:`, err);
    }
  } else {
    console.error(`❌ Unknown app/action: ${app}/${action}`);
  }
});

ipcMain.handle('hide-background-apps', () => workspaceManager.hideBackgroundApps());
ipcMain.handle('show-all-apps', () => workspaceManager.showAllApps());
ipcMain.handle('start-auto-hide', () => workspaceManager.startAutoHide());
ipcMain.handle('stop-auto-hide', () => workspaceManager.stopAutoHide());
ipcMain.handle('pause-workspace', () => workspaceManager.pauseWorkspace());
ipcMain.handle('resume-workspace', () => workspaceManager.resumeWorkspace());
ipcMain.handle('clear-workspace', async () => {
  const apps = await clearWorkspace();
  return apps;
});
ipcMain.handle('get-session-data', () => getSessionData());
ipcMain.on('hide-overlay', (event, { reason }) => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }

  if (reason === 'escape') {
    if (overlayOpenedFromGlobal) {
      app.hide();  // ✅ Only hide if global overlay was used
    }
    overlayOpenedFromGlobal = false;  // Reset flag
  } else if (reason === 'shift') {
    if (sessionWindow && !sessionWindow.isDestroyed()) sessionWindow.show();
    if (launcherWindow && !launcherWindow.isDestroyed()) launcherWindow.show();
    overlayOpenedFromGlobal = false;  // Reset flag
  }
});


app.on('activate', () => {
  const dashboardVisible = sessionWindow && !sessionWindow.isDestroyed() && sessionWindow.isVisible();
  const launcherVisible = launcherWindow && !launcherWindow.isDestroyed() && launcherWindow.isVisible();
  const overlayVisible = overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible();

  // If no windows are visible, bring back the **session window (Dashboard)**
  if (!dashboardVisible && !launcherVisible && !overlayVisible) {
    if (sessionWindow && !sessionWindow.isDestroyed()) {
      sessionWindow.show();
    }
  }
});


app.whenReady().then(() => {
  createWindow();
});
