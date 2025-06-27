const { app } = require('electron');
app.setName("Cortex");
const { ipcMain } = require('electron');
const {
  getSessionData,
  isAppInWorkspace,
  saveSession,
  loadSession,
  updateSessionData,
  launchApp,
  startSession,
  pollActiveWindow,
  startPollingWindowState,
  stopPollingWindowState,
  sessionData,
} = require('./core/sessionManager');
const path = require('path');
const { BrowserWindow, screen } = require('electron');
const { dialog } = require('electron');
const chromeDriver = require('./core/drivers/chromeDriver');
const { chromeSessionProfile } = require('./core/drivers/chromeDriver');
const { clearWorkspace, getPreviouslyHiddenApps } = require('./core/workspaceManager');
const { toggleDockAutohide } = require('./core/systemUIManager');
const { showApps } = require('./utils/applescript');
const fs = require('fs');
const { exec } = require('child_process');

let sessionwin;


const appDrivers = {
  chrome: chromeDriver,
  vscode: require('./core/drivers/vscode'),
  // add vscode, terminal, etc.
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173/index.html');
  }
}

async function startCortexSession() {
  startSession();
  const hiddenApps = await clearWorkspace();
  await toggleDockAutohide(true);

  const { bounds } = screen.getPrimaryDisplay();

  sessionwin = new BrowserWindow({
    title: "Cortex",
    titleBarStyle: "hiddenInset",
    show: false, // <- Hide until ready
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


  sessionwin.loadURL('http://localhost:5173/session');

  // Wait for content + dock autohide before showing
  sessionwin.once('ready-to-show', () => {
    setTimeout(() => {
      sessionwin.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      });
      sessionwin.show(); // <- now show it!
      console.log("🧱 Visual fullscreen complete");
    }, 2000);
  });

  updateSessionData({
    type: 'workspace_cleared',
    items: hiddenApps,
  });

  sessionwin.on('closed', () => {
    stopPollingWindowState();
    toggleDockAutohide(false);
    const previouslyHidden = getPreviouslyHiddenApps();
    if (previouslyHidden?.length) showApps(previouslyHidden);
    const sessionData = getSessionData();
    const wasChromeTracked = sessionData?.liveWorkspace?.apps?.some(
      (app) => app.name.toLowerCase() === 'google chrome'
    );
    if (wasChromeTracked) {
      exec(`osascript -e 'tell application "Google Chrome" to quit'`, (err) => {
        if (err) console.error('❌ Chrome quit failed:', err.message);
        else console.log('🧼 Chrome instance quit successfully.');
      });
    }
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

ipcMain.on('open-window', async (_, type) => {
  if (type === 'start-session') {
    await startCortexSession();
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
  if (!appPath.endsWith('.app')) {
    console.error('❌ Selected file is not a .app bundle');
    return null;
  }

  const appName = appPath.split('/').pop().replace('.app', '');

  const newTab = {
    type: 'app_opened',
    name: appName,
    path: appPath,
    windowTitle: appName,
    isActive: true,
    addedAt: new Date().toISOString(),
    launchedViaCortex: true,
  };

  updateSessionData(newTab);
  return newTab;
});

ipcMain.handle('launch-app', (_, appPath) => {
  launchApp(appPath);
});

ipcMain.handle('app-control', async (event, { app, action, payload }) => {
  const driver = appDrivers[app];

  if (driver && typeof driver[action] === 'function') {
    try {
      if (app === 'chrome' && action === 'openTab') {
        if (!isAppInWorkspace('Google Chrome')) {
          console.log('🔍 Chrome not in workspace — launching new window');
          await driver.openNewWindowWithTab(payload);
        } else {
          console.log('🔍 Chrome already in workspace — opening new tab');
          await driver.openTab(payload);
        }

        updateSessionData({
          type: 'app_opened',
          name: 'Google Chrome',
          path: '/Applications/Google Chrome.app',
          windowTitle: payload,
          isActive: true,
          launchedViaCortex: true,
        });
        return;
      }

      await driver[action](payload);

      if (["openTab", "launch", "openNewWindowWithTab"].includes(action)) {
        updateSessionData({
          type: 'app_opened',
          name: app,
          path: '/Applications/Google Chrome.app',
          windowTitle: payload,
          isActive: true,
          launchedViaCortex: true,
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

app.whenReady().then(() => {
  createWindow();
});
