const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog, clipboard } = require('electron');
const { autoUpdater } = require('electron-updater');
require('./core/gptRouter');
const { exec } = require('child_process');
require('dotenv').config();
const { getInstalledApps, getInstalledAppsWithIcons, extractIcon } = require('./core/appDiscovery');
const { smartLaunchApp, openChromeWithSearch } = require('./core/appLauncher');
const { activateApp,
  activateChromeTabById,
  activateNavigatorItem,
  activateByAppId} = require('./core/appNavigator');
  const { loadSettings, saveSettings } = require('./settingsManager');
const RECENT_APPS_FILE = path.join(app.getPath('userData'), 'recent-apps.json');
const { v4 } = require('uuid');
const ONBOARDING_FLAG_PATH = path.join(app.getPath('userData'), 'onboarding.json');


autoUpdater.checkForUpdatesAndNotify();
let recentApps = [];

function isValidMacApp(appPath) {
  return typeof appPath === 'string' && appPath.endsWith('.app') && fs.existsSync(appPath);
}

//onboarding logic

function hasCompletedOnboarding() {
  return fs.existsSync(ONBOARDING_FLAG_PATH);
}

function markOnboardingComplete() {
  fs.writeFileSync(ONBOARDING_FLAG_PATH, JSON.stringify({ done: true }));
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
  stopPollingWindowState,
  getLiveWorkspace,
  removeAppFromWorkspace,
  addAppToWorkspace,
} = require('./core/sessionManager');

const {
  clearWorkspace,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace,
  autoHideInterval
} = require('./core/workspaceManager');

const chromeDriver = require('./core/drivers/chromeDriver');
const vscodeDriver = require('./core/drivers/vscode');
const workspaceManager = require('./core/workspaceManager');
const { toggleDockAutohide } = require('./core/systemUIManager');
const { showApps, quitAppByName, triggerAutomationAndAccessibilityPrompt } = require('./utils/applescript');
const sessionManager = require('./core/sessionManager');
const isDev = false

app.setName("Cortex");
let hotkeysEnabled = false;
let overlayWindow;
let launcherWindow;
let sessionWindow;
let hudWindow;
let overlayOpenedFromGlobal = false;
let isSessionPaused = false;
global.cortexSettings = loadSettings();
let cachedInstalledApps = null;
let currentSessionId = null;

const appDrivers = { chrome: chromeDriver, vscode: vscodeDriver };

const iconPath = path.resolve(
  app.getAppPath(),
  'renderer',
  'public',
  'icons',
  'cortexlogov2.icns'
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
  if (isDev) {
    win.loadURL('http://localhost:5173/');
  } else {
    win.loadFile(path.join(__dirname, 'renderer/dist/index.html'), {
      hash: '/',
    });
  }
  win.on('closed', () => { launcherWindow = null; });
  launcherWindow = win;
}

function createOnboarding() {
  const onboardingWin = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: { preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
     },
  });
  
  if (isDev) {
    onboardingWin.loadURL('http://localhost:5173#/onboarding');
  } else {
    onboardingWin.loadURL(`file://${path.join(__dirname, 'renderer/dist/index.html')}#/onboarding`);
  }

  onboardingWin.on('closed', () => {
    
    createWindow();
  })
}

function createSessionWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  const win = new BrowserWindow({
    title: "Cortex",
    icon: iconPath,
    frame: true,
    show: false,
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    webPreferences: { preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,  //currently needed to display appicons in smartlauncher, will need to overhaul in the future
     },
  });
  if (isDev) {
    win.loadURL('http://localhost:5173/#session');
  } else {
    win.loadURL(`file://${path.join(__dirname, 'renderer/dist/index.html')}#/session`);
  }

  win.on('close', async (e) => {
    e.preventDefault();
    await saveSession();
    chromeDriver.quitCortexChromeInstances();
    stopPollingWindowState();
    stopAutoHide();
    unregisterHotkeys();
    workspaceManager.stopAutoHide && workspaceManager.stopAutoHide();
    if (overlayWindow) {
      overlayWindow.destroy();
    }
    if (hudWindow) {
      hudWindow.destroy();
    }
    
    win.destroy();
    sessionWindow = null;
  });

  win.on('closed', () => {
    toggleDockAutohide(false);
    if (workspaceManager.getPreviouslyHiddenApps) {
      const previouslyHidden = workspaceManager.getPreviouslyHiddenApps();
      if (previouslyHidden?.length) showApps(previouslyHidden);
    }
    // createWindow();
    //open launcher again giving bugs so removing temporarily
  });

  win.on('focus', () => unregisterHotkeys());
  win.on('blur', () => registerHotkeys());

  sessionWindow = win;
  return win;
}

function createOverlayWindow() {

  overlayWindow = new BrowserWindow({
    x: 0, //temporary
    y: 0,
    width: 100,
    height: 100,
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
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, backgroundThrottling: false, webSecurity: false },
  });

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#overlay');
  } else {
    overlayWindow.loadURL(`file://${path.join(__dirname, 'renderer/dist/index.html')}#/overlay`);
  }
  overlayWindow.hide();
  sessionManager.setOverlayWindow(overlayWindow);

    // Add focus/blur event listeners with state checking
    overlayWindow.on('focus', () => {
      console.log('🎯 overlay focused - stopping auto-hide');
      if (autoHideInterval) {
        stopAutoHide();
      }
    });
    
  
  overlayWindow.on('blur', () => {
    if (!overlayWindow.isDestroyed()) overlayWindow.hide();

    console.log('👋 overlay blurred - attempting auto-hide...');
      setTimeout(() => {
        if (!autoHideInterval && !isSessionPaused) {
          console.log('⚙️ Session active — starting auto-hide');
          startAutoHide();
        } else if (isSessionPaused) {
          console.log('⏸️ Session is paused — skipping auto-hide');
        }
      }, 500);
  });

  overlayWindow.on('closed', () => { overlayWindow = null; });
}


function createHUDWindow() {
  const MARGIN_RIGHT = 24;
const MARGIN_BOTTOM = 24;
const COLLAPSED_WIDTH = 220;
const COLLAPSED_HEIGHT = 70;

  const { bounds } = screen.getPrimaryDisplay();

  const x = bounds.x + bounds.width - COLLAPSED_WIDTH - MARGIN_RIGHT;
  const y = bounds.y + bounds.height - COLLAPSED_HEIGHT - MARGIN_BOTTOM;

  hudWindow = new BrowserWindow({
    x,
    y,
    width: COLLAPSED_WIDTH,
    height: COLLAPSED_HEIGHT,
    frame: false,
    transparent: true,
    roundedCorners: true,
    vibrancy: 'under-window',
    thickFrame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false, // can be set to true if you want animated resizing
    alwaysOnTop: true,
    skipTaskbar: true,
    movable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      webSecurity: false,
    },
  });
  if (isDev) {
    hudWindow.loadURL('http://localhost:5173/#hud');
  } else {
    hudWindow.loadURL(`file://${path.join(__dirname, 'renderer/dist/index.html')}#/hud`);
  }

  sessionManager.setHudWindow(hudWindow);

  // Add focus/blur event listeners with state checking
  hudWindow.on('focus', () => {
    console.log('🎯 HUD focused - stopping auto-hide');
    if (autoHideInterval) {
      stopAutoHide();
    }
  });
  
  hudWindow.on('blur', () => {
    console.log('👋 HUD blurred - attempting auto-hide...');
    setTimeout(() => {
      if (!autoHideInterval && !isSessionPaused) {
        console.log('⚙️ Session active — starting auto-hide');
        startAutoHide();
      } else if (isSessionPaused) {
        console.log('⏸️ Session is paused — skipping auto-hide');
      }
    }, 500);
  });

  hudWindow.on('closed', () => {
    hudWindow = null;
  });
}

function showOverlay(type) {
  if (!overlayWindow) return;

  const { bounds } = screen.getPrimaryDisplay();
  let width = 896, height = 860;
  let x, y;

  switch (type) {
    case 'navigator':
      width = 896; height = 860;
      break;
    case 'launcher':
      width = 800; height = 470;
      break;
    case 'ai':
      width = 384; height = 485;
      x = bounds.width - width - 24;
      y = bounds.height - height - 24;
      break;
    case 'utilities':
      width = 500; height = 650;
      x = bounds.width - width - 24;
      y = bounds.height - height - 24;
      break;
    default:
      break;
  }

  // Recalculate x/y for center-aligned overlays
  if (x === undefined || y === undefined) {
    x = Math.round((bounds.width - width) / 2);
    y = Math.round((bounds.height - height) / 2);
  }

  overlayWindow.setBounds({ x, y, width, height });
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

  globalShortcut.register('Option+Space', () => {
    if (overlayWindow?.isVisible()) hideOverlay();
    else {
      overlayOpenedFromGlobal = true;
      if (launcherWindow?.isVisible()) launcherWindow.hide();
      if (sessionWindow?.isVisible()) sessionWindow.hide();
      showOverlay('ai');
    }
  });

  globalShortcut.register('Option+U', () => {
    if (overlayWindow?.isVisible()) hideOverlay();
    else {
      overlayOpenedFromGlobal = true;
      if (launcherWindow?.isVisible()) launcherWindow.hide();
      if (sessionWindow?.isVisible()) sessionWindow.hide();
      showOverlay('utilities');
    }
  });
}

function unregisterHotkeys() {
  if (!hotkeysEnabled) return;
  hotkeysEnabled = false;
  globalShortcut.unregisterAll();
}

async function startCortexSession() {
  const hiddenApps = await clearWorkspace(); // wait for hideApps to fully complete
  updateSessionData({ type: 'workspace_cleared', items: hiddenApps });

  //session id generation:
  const sessionId = v4();
  currentSessionId = sessionId;
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('cortex:new-session-started', sessionId);
  });



  toggleDockAutohide(true);
  registerHotkeys();

    // ⏳ Preload installed apps and cache them
    try {
      cachedInstalledApps = await getInstalledApps(); // you already have this imported
      console.log(`📦 Cached ${cachedInstalledApps.length} apps`);
    } catch (err) {
      console.error("Failed to preload apps:", err);
    }

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
      createHUDWindow();
      await startSession();       // polling + session setup
      startAutoHide();            // overlay visibility sync
      createOverlayWindow();      // floating HUD etc.
    }, 2000);
  });
}


//HUD FUNCTIONS
function openDashboardWindow() {
  if (sessionWindow && !sessionWindow.isDestroyed()) {
    sessionWindow.show();
    sessionWindow.focus();
  } else {
    createSessionWindow();
  }
}

function getLastFocusedApp() {
  const sessionData = getSessionData();
  const lastFocused = sessionData?.lastFocusedWindow;
  if (!lastFocused) return null;

  return {
    name: lastFocused.appName,
    title: lastFocused.windowTitle,
    appId: lastFocused.appId || null, // optional: helpful for workspace tracking
  };
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

ipcMain.handle('get-clipboard-text', () => {
  try {
    const text = clipboard.readText();
    return text;
  } catch (err) {
    console.error('❌ Failed to read clipboard:', err);
    return '';
  }
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
ipcMain.handle('pause-workspace', () => { pauseWorkspace(); isSessionPaused = true;});
ipcMain.handle('resume-workspace', () => { resumeWorkspace(); isSessionPaused = false});
ipcMain.handle('clear-workspace', async () => { return await clearWorkspace(); });
ipcMain.handle('get-session-data', () => ({
  liveWorkspace: getSessionData()
}));
ipcMain.handle('get-live-workspace', () => {
  console.log("🛰️ main: get-live-workspace handler invoked");
  try {
    const data = getLiveWorkspace();
    console.log("🧩 sessionData.liveWorkspace:", data);
    return data;
  } catch (err) {
    console.error("❌ Error in getLiveWorkspace handler:", err);
    return null;
  }
});
ipcMain.on('hide-overlay', (event, { reason }) => {
  hideOverlay();
  if (reason === 'escape') {
    if (overlayOpenedFromGlobal) {
      overlayWindow.hide();
      sessionWindow.hide();

    }
    hudWindow.show();
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

ipcMain.on('resize-hud-window', (event, { width, height }) => {
  if (hudWindow) {
    const { x, y } = hudWindow.getBounds();
    const newX = x + hudWindow.getBounds().width - width;  // keep right-aligned
    const newY = y + hudWindow.getBounds().height - height; // keep bottom-aligned

    hudWindow.setBounds({
      x: newX,
      y: newY,
      width,
      height,
    }, true); // animate = true
  }
});
ipcMain.on('resize-overlay-window', (event, { width, height }) => {
  if (overlayWindow) {
    const { x, y, width: oldWidth, height: oldHeight } = overlayWindow.getBounds();
    const newX = x + oldWidth - width;   // keep right-aligned
    const newY = y + oldHeight - height; // keep bottom-aligned

    overlayWindow.setBounds({
      x: newX,
      y: newY,
      width,
      height,
    }, true); // animate resize
  }
});
ipcMain.handle('activate-navigator-item', async (_e, item) => {
  try {
    await activateNavigatorItem(item);
  } catch (err) {
    console.error("❌ Failed to activate item via navigator:", err);
  }
});

ipcMain.handle('request-live-workspace-push', () => {

const workspace = getLiveWorkspace();
sessionWindow?.webContents.send('live-workspace-update', workspace);
overlayWindow?.webContents.send('live-workspace-update', workspace);
})

ipcMain.handle('close-app', async (event, appId) => {
  console.log(`🛑 Closing app with id: ${appId}`);

  const sessionData = getSessionData();

  const app = sessionData.liveWorkspace?.apps.find(a => a.id === appId);
  if (!app) {
    console.warn("⚠️ App not found in session data:", appId);
    return false;
  }

  quitAppByName(app.name);
  return removeAppFromWorkspace(appId);
});

// Remove the app from the workspace (but don't kill it)
ipcMain.handle('remove-app-from-workspace', async (event, appId) => {
  return removeAppFromWorkspace(appId);
});

ipcMain.handle('add-app-to-workspace', async (event, appId) => {
  return addAppToWorkspace(appId);
});
ipcMain.handle('is-app-in-workspace', (event, appId) => {
  return isAppInWorkspace(appId);
});

ipcMain.handle('open-dashboard', () => openDashboardWindow());
ipcMain.handle('open-spatial-navigator', () => showOverlay('navigator'));
ipcMain.handle('open-inline-gpt', () => showOverlay('ai'));
ipcMain.handle('open-utilities-overlay', () => showOverlay('utilities'));
ipcMain.handle('open-smart-launcher', () => showOverlay('launcher'));
ipcMain.handle('get-current-app', () => getLastFocusedApp());

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (_, newSettings) => {
  saveSettings(newSettings);
});
ipcMain.handle('get-preloaded-apps', () => {
  return cachedInstalledApps;
});

ipcMain.handle("trigger-permission-prompts", () => {
  triggerAutomationAndAccessibilityPrompt();
});

ipcMain.handle('getCurrentSessionId', async () => {
  return currentSessionId;
});

ipcMain.on('onboarding-complete', (event) => {
  console.log('✅ Onboarding is complete');
  markOnboardingComplete();
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



  if (isDev ||!hasCompletedOnboarding()) {
    createOnboarding();
  } else {
    createWindow();
  }
});
