const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog } = require('electron');
const { exec } = require('child_process');
require('dotenv').config();
const { getInstalledApps, getInstalledAppsWithIcons, extractIcon } = require('./core/appDiscovery');
const { smartLaunchApp, openChromeWithSearch } = require('./core/appLauncher');

const RECENT_APPS_FILE = path.join(app.getPath('userData'), 'recent-apps.json');
let recentApps = [];

function isValidMacApp(appPath) {
  return typeof appPath === 'string' && appPath.endsWith('.app') && fs.existsSync(appPath);
}

async function loadRecentApps() {
  try {
    if (fs.existsSync(RECENT_APPS_FILE)) {
      const data = await fs.promises.readFile(RECENT_APPS_FILE, 'utf-8');
      const loadedApps = JSON.parse(data);
      const validApps = loadedApps.filter(app => isValidMacApp(app.path));
      recentApps = await Promise.all(validApps.map(async app => ({
        ...app,
        icon: await extractIcon(app.path)
      })));
    } else {
      recentApps = [];
    }
  } catch (err) {
    console.error('❌ Failed to load recent apps:', err);
    recentApps = [];
  }
}

async function markAppAsUsed(app) {
  if (!isValidMacApp(app.path)) {
    console.warn(`⚠️ Skipping invalid app: ${app.path}`);
    return;
  }
  recentApps = recentApps.filter(item => item.path !== app.path);
  recentApps.unshift({
    name: app.name,
    path: app.path,
    icon: app.icon || null,
  });
  if (recentApps.length > 10) {
    recentApps = recentApps.slice(0, 10);
  }
  try {
    await fs.promises.writeFile(RECENT_APPS_FILE, JSON.stringify(recentApps, null, 2));
  } catch (err) {
    console.error('❌ Failed to write recent apps:', err);
  }
}

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
    webPreferences: { preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
     },
  });
  win.loadURL('http://localhost:5173/');
  win.on('closed', () => { launcherWindow = null; });
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
    webPreferences: { preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,  //currently needed to display appicons in smartlauncher, will need to overhaul in the future
     },
  });
  win.loadURL('http://localhost:5173/session');

  win.on('close', async (e) => {
    e.preventDefault();
    await saveSession();
    stopPollingWindowState();
    unregisterHotkeys();
    workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
    chromeDriver.quitCortexChromeInstances();
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
      exec(`osascript -e 'tell application "Google Chrome" to quit'`, (err) => {
        if (err) console.error("❌ Chrome quit failed:", err.message);
        else console.log("🧼 Chrome instance quit successfully.");
      });
    }
    createWindow();
  });

  win.on('focus', () => unregisterHotkeys());
  win.on('blur', () => registerHotkeys());

  sessionWindow = win;
  return win;
}

function createOverlayWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  const defaultWidth = 896;
  const defaultHeight = 860;

  overlayWindow = new BrowserWindow({
    x: Math.round((bounds.width - defaultWidth) / 2),
    y: Math.round((bounds.height - defaultHeight) / 2),
    width: defaultWidth,
    height: defaultHeight,
    frame: false,
    transparent: true,
    roundedCorners: true,
    vibrancy: 'under-window',
    thickFrame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    movable: false,
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false, webSecurity: false },
  });

  overlayWindow.loadURL('http://localhost:5173/overlay');
  overlayWindow.hide();

  overlayWindow.on('blur', () => {
    if (!overlayWindow.isDestroyed()) overlayWindow.hide();
  });

  overlayWindow.on('closed', () => { overlayWindow = null; });
}

function showOverlay(type) {
  if (!overlayWindow) return;

  const { bounds } = screen.getPrimaryDisplay();
  let width = 896, height = 860;

  switch (type) {
    case 'navigator':
      width = 896; height = 860;
      break;
    case 'launcher': //estimated for now, switch to dynamically sized in the future
      width = 800; height = 470;
      break;
    case 'ai':
      width = 600; height = 500;
      break;
    case 'utilities':
      width = 500; height = 300;
      break;
    default:
      break;
  }

  overlayWindow.setBounds({
    x: Math.round((bounds.width - width) / 2),
    y: Math.round((bounds.height - height) / 2),
    width,
    height,
  });

  overlayWindow.show();
  overlayWindow.focus();
  overlayWindow.webContents.send('show-overlay', type);
}

function hideOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
    overlayWindow.webContents.send('hide-overlay');
  }
}

function registerHotkeys() {
  if (hotkeysEnabled) return;
  hotkeysEnabled = true;

  globalShortcut.register('Option+Tab', () => {
    if (overlayWindow?.isVisible()) hideOverlay();
    else {
      overlayOpenedFromGlobal = true;
      if (launcherWindow?.isVisible()) launcherWindow.hide();
      if (sessionWindow?.isVisible()) sessionWindow.hide();
      showOverlay('navigator');
    }
  });

  globalShortcut.register('Option+Return', () => {
    if (overlayWindow?.isVisible()) hideOverlay();
    else {
      overlayOpenedFromGlobal = true;
      if (launcherWindow?.isVisible()) launcherWindow.hide();
      if (sessionWindow?.isVisible()) sessionWindow.hide();
      showOverlay('launcher');
    }
  });

  // Optional: Add more hotkeys here, e.g.
  // globalShortcut.register('Option+I', () => showOverlay('ai'));
  // globalShortcut.register('Option+U', () => showOverlay('utilities'));
}

function unregisterHotkeys() {
  if (!hotkeysEnabled) return;
  hotkeysEnabled = false;
  globalShortcut.unregisterAll();
}

async function startCortexSession() {
  const hiddenApps = await clearWorkspace(); // wait for hideApps to fully complete
  updateSessionData({ type: 'workspace_cleared', items: hiddenApps });

  toggleDockAutohide(true);
  registerHotkeys();

  const sessionwin = createSessionWindow();
  sessionwin.once('ready-to-show', async () => {
    // Optional: shorten or remove timeout if unnecessary
    setTimeout(async () => {
      sessionwin.maximize();
      sessionwin.show();

      if (launcherWindow && !launcherWindow.isDestroyed()) {
        launcherWindow.close();
        launcherWindow = null;
      }

      sessionManager.setMainWindow(sessionwin);
      await startSession();       // polling + session setup
      startAutoHide();            // overlay visibility sync
      createOverlayWindow();      // floating HUD etc.
    }, 2000);
  });
}

ipcMain.handle('get-installed-apps', async () => {
  const apps = await getInstalledApps();
  const safeApps = apps.map(app => ({
    name: String(app.name || ''),
    path: String(app.path || ''),
    icon: typeof app.icon === 'string' ? app.icon : null,
  }));
  return safeApps;
});


ipcMain.handle('get-recent-apps', () => recentApps);
ipcMain.handle('mark-app-used', (_, app) => markAppAsUsed(app));
ipcMain.handle('save-session', async () => { await saveSession(); stopPollingWindowState(); workspaceManager.stopAutoHide && workspaceManager.stopAutoHide(); sessionWindow.close(); return { ok: true }; });
ipcMain.handle('load-session', () => loadSession());
ipcMain.on('open-window', async (_, type) => { if (type === 'start-session') await startCortexSession(); });
ipcMain.on('update-session', (_, tab) => updateSessionData(tab));
ipcMain.handle('choose-app', async () => { const result = await dialog.showOpenDialog({ title: 'Choose an App', defaultPath: '/Applications', properties: ['openFile','dontAddToRecent'], }); if (result.canceled||!result.filePaths.length) return null; const appPath = result.filePaths[0]; if (!appPath.endsWith('.app')) return null; const appName = path.basename(appPath, '.app'); const newTab = { type:'app_opened', name:appName, path:appPath, windowTitle:appName, isActive:true, addedAt:new Date().toISOString(), launchedViaCortex:true }; updateSessionData(newTab); return newTab; });
ipcMain.handle('launch-app', (_, appPath) => launchApp(appPath));
ipcMain.handle('app-control', async (_, { app, action, payload }) => { const driver = appDrivers[app]; if (driver?.[action] instanceof Function) { try { if (app==='chrome'&&action==='openTab') { if (!isAppInWorkspace('Google Chrome')) await driver.openNewWindowWithTab(payload); else await driver.openTab(payload); updateSessionData({ type:'app_opened', name:'Google Chrome', path:'/Applications/Google Chrome.app', windowTitle:payload, isActive:true, launchedViaCortex:true }); return; } await driver[action](payload); if (['openTab','launch','openNewWindowWithTab'].includes(action)) { updateSessionData({ type:'app_opened', name:app, path:'/Applications/Google Chrome.app', windowTitle:payload, isActive:true, launchedViaCortex:true }); } } catch (err) { console.error(`❌ Failed to perform ${action} on ${app}:`, err); } } else { console.error(`❌ Unknown app/action: ${app}/${action}`); } });
ipcMain.handle('hide-background-apps', () => workspaceManager.hideBackgroundApps());
ipcMain.handle('show-all-apps', () => workspaceManager.showAllApps());
ipcMain.handle('start-auto-hide', () => workspaceManager.startAutoHide());
ipcMain.handle('stop-auto-hide', () => workspaceManager.stopAutoHide());
ipcMain.handle('pause-workspace', () => workspaceManager.pauseWorkspace());
ipcMain.handle('resume-workspace', () => workspaceManager.resumeWorkspace());
ipcMain.handle('clear-workspace', async () => { return await clearWorkspace(); });
ipcMain.handle('get-session-data', () => getSessionData());
ipcMain.on('hide-overlay', (event, { reason }) => {
  hideOverlay();
  if (reason === 'escape') {
    if (overlayOpenedFromGlobal) app.hide();
    overlayOpenedFromGlobal = false;
  } else if (reason === 'shift') {
    if (sessionWindow && !sessionWindow.isDestroyed()) sessionWindow.show();
    if (launcherWindow && !launcherWindow.isDestroyed()) launcherWindow.show();
    overlayOpenedFromGlobal = false;
  }
});
ipcMain.handle('smart-launch-app', async (event, app) => {
  const result = await smartLaunchApp(app);
  return result;
});
ipcMain.handle('open-chrome-search', async (event, query) => {
  try {
    openChromeWithSearch(query, (status) => {
      console.log('[Chrome Search]', status.message);
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to open Chrome search:', error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle('get-app-icon', async (event, appPath) => {
  return await extractIcon(appPath);
});

app.on('activate', () => {
  const dashboardVisible = sessionWindow && !sessionWindow.isDestroyed() && sessionWindow.isVisible();
  const launcherVisible  = launcherWindow && !launcherWindow.isDestroyed()  && launcherWindow.isVisible();
  const overlayVisible   = overlayWindow  && !overlayWindow.isDestroyed()   && overlayWindow.isVisible();
  if (!dashboardVisible && !launcherVisible && !overlayVisible) {
    if (sessionWindow && !sessionWindow.isDestroyed()) sessionWindow.show();
  }
});

app.whenReady().then(async () => {
  await loadRecentApps();
  createWindow();
});
