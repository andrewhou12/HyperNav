const path = require('path');
const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
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

const chromeDriver = require('./core/drivers/chromeDriver');
const vscodeDriver = require('./core/drivers/vscode');
const workspaceManager = require('./core/workspaceManager');
const { toggleDockAutohide } = require('./core/systemUIManager');
const { showApps } = require('./utils/applescript');
const { askGPT } = require('./core/gptRouter');
const sessionManager = require('./core/sessionManager');

app.setName("Cortex");

const appDrivers = {
  chrome: chromeDriver,
  vscode: vscodeDriver,
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL('http://localhost:5173/index.html');
}

function createSessionWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  const win = new BrowserWindow({
    title: "Cortex",
    frame: true,
    titleBarStyle: "hiddenInset",
    show: false,
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL('http://localhost:5173/session.html');

  // Auto-save & cleanup before actual close
  win.on('close', async (e) => {
    e.preventDefault();
    await saveSession();
    stopPollingWindowState();
    workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
    win.destroy();
  });

  // Post-close cleanup (e.g. UI restore)
  win.on("closed", () => {
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
      exec(`osascript -e 'tell application "Google Chrome" to quit'`, (err) => {
        if (err) console.error("❌ Chrome quit failed:", err.message);
        else console.log("🧼 Chrome instance quit successfully.");
      });
    }
  });

  return win;
}

async function startCortexSession() {
  
  const hiddenApps = await workspaceManager.clearWorkspace();
  await toggleDockAutohide(true);

  sessionwin = createSessionWindow();
  sessionwin.once("ready-to-show", () => {
    setTimeout(() => {
      sessionwin.maximize();
      sessionwin.show();
    }, 1500);
  sessionManager.setMainWindow(sessionwin)
  startSession();
  });

  updateSessionData({ type: "workspace_cleared", items: hiddenApps });
}

ipcMain.handle('save-session', async () => {
  await saveSession();
  stopPollingWindowState();
  workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
  sessionwin.close();
  return { ok: true };
});

ipcMain.handle('load-session', () => loadSession());
ipcMain.on('open-window', async (_, type) => {
  if (type === 'start-session') await startCortexSession();
});
ipcMain.on('update-session', (event, tab) => updateSessionData(tab));
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
    type: 'app_opened', name: appName, path: appPath,
    windowTitle: appName, isActive: true,
    addedAt: new Date().toISOString(), launchedViaCortex: true
  };
  updateSessionData(newTab);
  return newTab;
});

ipcMain.handle('launch-app', (_, appPath) => launchApp(appPath));
ipcMain.handle('app-control', async (event, { app, action, payload }) => {
  const driver = appDrivers[app];
  if (driver && typeof driver[action] === 'function') {
    try {
      if (app === 'chrome' && action === 'openTab') {
        if (!isAppInWorkspace('Google Chrome'))
          await driver.openNewWindowWithTab(payload);
        else await driver.openTab(payload);
        updateSessionData({ type: 'app_opened', name: 'Google Chrome', path: '/Applications/Google Chrome.app', windowTitle: payload, isActive: true, launchedViaCortex: true });
        return;
      }
      await driver[action](payload);
      if (['openTab', 'launch', 'openNewWindowWithTab'].includes(action)) {
        updateSessionData({ type: 'app_opened', name: app, path: '/Applications/Google Chrome.app', windowTitle: payload, isActive: true, launchedViaCortex: true });
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

app.whenReady().then(() => { createWindow(); });