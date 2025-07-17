const path = require('path');
const { app } = require('electron');
const fs = require('fs');
const { exec } = require('child_process');
const activeWin = require('active-win');
const { getActiveChromeTabInfo, getChromeWindowsAndTabs } = require('../utils/chromeTracker');
const { getOpenApps, hideApps } = require('../utils/applescript');
const permissions = require('node-mac-permissions');
const sessionDir = path.join(app.getPath('userData'), 'sessions');
let sessionData = null;
let pollInterval = null;
let pollingActive = false;
let lastFocus = {};
let mainWindow = null;
let overlayWindow = null;
let initiallyHiddenApps = new Set();
let lastRunningAppNames = new Set(); 
let lastUntrackedApp = null;

let accessibilityGranted = permissions.getAuthStatus('accessibility') === 'authorized';

if (!accessibilityGranted) {
  console.warn('🔐 Accessibility access not granted. Requesting it now...');
  permissions.askForAccessibilityAccess(); // opens System Settings
}
function setMainWindow(win) {
  mainWindow = win;
}

function setOverlayWindow(win) {
  overlayWindow = win;
}

function setHudWindow(win) {
  hudWindow = win;
}

function setInitiallyHiddenApps(appNames) {
  initiallyHiddenApps = new Set(appNames);
}

function getSessionData() {
  return sessionData;
}
function generateAppId(appName, appPath) {
  if (appPath) {
    return `app-${Buffer.from(appPath).toString('base64')}`;
  }
  return `app-${appName.replace(/\s+/g, '_').toLowerCase()}`;
}

function getLiveWorkspace() {
  console.log('📦 sessionManager: getLiveWorkspace called');
  console.log(sessionData?.liveWorkspace);
  return sessionData?.liveWorkspace;
}

function updateSessionData(item) {
  if (!sessionData) return;

  const timestamp = new Date().toISOString();
  const entry = { type: item.type, timestamp, data: item };

  if (item.type === "app_opened") {
    const alreadyExists = sessionData.liveWorkspace.apps.some(a => a.path === item.path);
    if (!alreadyExists) {
      const newApp = {
        id: item.id || generateAppId(item.name, item.path),
        name: item.name,
        icon: item.icon || "folder",
        path: item.path,
        windows: []
      };
      sessionData.liveWorkspace.apps.push(newApp);
      mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
      overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
      hudWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
      
    }
  } else if (item.type === "tab_closed") {
    for (const app of sessionData.liveWorkspace.apps) {
      if (app.windows) {
        for (const win of app.windows) {
          win.tabs = win.tabs?.filter(tab => tab.id !== item.tabId);
        }
      }
    }
    mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
    overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
    hudWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  }
  else if (item.type === "app_quit") {
    console.log(`📝 Logged app quit: ${item.name}`);
  }

  else if (item.type === "session_paused") {

    mainWindow.webContents.send('session-status-updated', true);
    overlayWindow?.webContents.send('session-status-updated', true);
    hudWindow?.webContents.send('session-status-updated', true);
    console.log('session paused')
  }

  else if (item.type === "session_resumed") {

    mainWindow.webContents.send('session-status-updated', false);
    overlayWindow?.webContents.send('session-status-updated', false);
    hudWindow?.webContents.send('session-status-updated', false);
    console.log('session resumed')

    
  }
  sessionData.eventLog.push(entry);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow?.webContents.send('session-log-entry', entry);
  }
  
}

async function startSession() {
  sessionData = {
    sessionName: `Session_${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    liveWorkspace: { apps: [], activeAppId: null, activeWindowId: null },
    eventLog: []
  };
  console.log("🟢 New session started:", sessionData.sessionName);

  // 👇 Wrap getOpenApps in a Promise so we can await it
  const apps = await new Promise(resolve => getOpenApps(resolve));
  if (!apps) {
    console.warn("⚠️ No open apps returned by getOpenApps");
    return;
  }

  setInitiallyHiddenApps(apps.map(app => app));
  console.log('✅ initiallyHiddenApps set:', apps);

  updateSessionData({
    type: 'session_started',
    sessionName: sessionData.sessionName
  });

  startPollingWindowState();
  mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
  hudWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
}



function onWorkspaceChange() {
  mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
  hudWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
}

function saveSession() {
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const filename = `session_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(path.join(sessionDir, filename), JSON.stringify(sessionData, null, 2));
  console.log(`✅ Session saved to ${filename}`);
}

function loadSession() {
  return null;
}

function launchApp(appPath) {
  exec(`open "${appPath}"`);
}



async function pollActiveWindow() {


  if (!accessibilityGranted) return;

    try {
      const win = await activeWin();
      if (!win) return;
  
      const { title, owner, id: windowId } = win;
      const appName = owner.name;
      const appPath = owner.path;
      const timestamp = new Date().toISOString();
      const appId = generateAppId(appName, appPath);
      const CORTEX_APP_NAME = 'Electron';
  
      // Skip garbage/self-detection
      if (!appName || appName === 'undefined' || appName === 'Cortex' || appName === CORTEX_APP_NAME) {
        console.warn('⚠️ Skipping Cortex window or invalid app:', appName);
      } else {
        const event = {
          type: appName === 'Google Chrome' ? 'tab_focus' : 'poll_snapshot',
          timestamp,
          appName,
          windowTitle: title,
        };
        sessionData.eventLog.push(event);
        lastFocus = { appName, windowTitle: title, timestamp };
  
        let matchingApp = sessionData.liveWorkspace.apps.find(app => {
          const matches = app.id === appId;
          if (!matches) {
            console.log(`🔍 App ID mismatch: ${app.id} !== ${appId} for ${app.name}`);
          }
          return matches;
        });
  
        if (matchingApp) {
          sessionData.liveWorkspace.activeAppId = matchingApp.id;
          sessionData.liveWorkspace.activeWindowId = windowId;
  
          for (const app of sessionData.liveWorkspace.apps) {
            app.windows = [];
            app.tabs = app.tabs?.map(tab => ({ ...tab, isActive: false })) || [];
          }
  
          if (appName === 'Google Chrome') {
            try {
              const tabs = await getChromeWindowsAndTabs();
              matchingApp.tabs = tabs;
  
              const activeTab = tabs.find(tab => tab.isActive);
              if (activeTab) {
                updateSessionData({
                  type: 'tab_changed',
                  source: 'poller',
                  appName: 'Google Chrome',
                  windowTitle: activeTab.title,
                  url: activeTab.url,
                  windowId,
                  tabId: activeTab.id,
                  timestamp,
                });
              }
            } catch (err) {
              console.warn('⚠️ Failed to get Chrome tabs:', err);
            }
          }
        } else {
          // Auto-add if not excluded
          if (!initiallyHiddenApps.has(appName) && appName !== 'Code') {
            matchingApp = {
              id: appId,
              name: appName,
              path: appPath || null,
              windows: [],
              tabs: [],
            };
            sessionData.liveWorkspace.apps.push(matchingApp);
            sessionData.liveWorkspace.activeAppId = matchingApp.id;
            sessionData.liveWorkspace.activeWindowId = windowId;
            console.log(`➕ Auto-added new app "${appName}" to workspace`);
          } else {
            lastUntrackedApp = {
              id: appId,
              name: appName,
              path: appPath || null,
              windows: [],
              tabs: [],
            };
            console.log(`📦 Stored excluded app "${appName}" as untracked`);
          }
        }
  
        sessionData.liveWorkspace.lastFocusedWindow = {
          appId,
          appName,
          windowTitle: title,
          windowId,
          timestamp,
        };
  
        mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
        overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
        hudWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
      }
  
      // ✅ Always run this — even if Cortex or invalid app was skipped
      try {
        const currentRunningAppNames = await new Promise(resolve => getOpenApps(resolve));
        const currentSet = new Set(currentRunningAppNames);
  
        for (const prevAppName of lastRunningAppNames) {
          if (!currentSet.has(prevAppName)) {
            const wasInWorkspace = sessionData.liveWorkspace.apps.find(app => app.name === prevAppName);
            if (wasInWorkspace) {
              console.log(`❌ App quit detected: ${prevAppName}`);
  
              updateSessionData({
                type: 'app_quit',
                name: wasInWorkspace.name,
                path: wasInWorkspace.path,
                id: wasInWorkspace.id,
              });
  
              sessionData.liveWorkspace.apps = sessionData.liveWorkspace.apps.filter(app => app.name !== prevAppName);
  
              mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
              overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
              hudWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
            }
          }
        }
  
        lastRunningAppNames = currentSet;
      } catch (err) {
        console.warn('⚠️ Failed to get running apps for quit detection:', err);
      }
  
    } catch (err) {
      console.error('❌ pollActiveWindow error:', err);
    }
  
}


function startPollingWindowState() {
  if (pollInterval) return;

  console.log("🟢 Started polling session state.");
  pollingActive = true;
  pollInterval = setInterval(async () => {
    if (!pollingActive) return;
    await pollActiveWindow();
  }, 1000);
}

function stopPollingWindowState() {
  if (!pollInterval) return;

  pollingActive = false;
  clearInterval(pollInterval);
  pollInterval = null;
  console.log("🛑 Stopped polling session state.");
}

function isAppInWorkspace(appName) {
  return sessionData?.liveWorkspace?.apps?.some(app => app.name === appName);
}

function removeAppFromWorkspace(appId) {
  const index = sessionData.liveWorkspace.apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    const app = sessionData.liveWorkspace.apps[index];
    sessionData.liveWorkspace.apps.splice(index, 1);

    if (sessionData.liveWorkspace.activeAppId === appId) {
      sessionData.liveWorkspace.activeAppId = null;
    }

    console.log(`🧹 Removed "${app.name}" from workspace`);

    mainWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
    overlayWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
    hudWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  }
}

function addAppToWorkspace(appId) {
  let app = sessionData.liveWorkspace.apps.find(a => a.id === appId);

  // Fallback to lastUntrackedApp if not found
  if (!app && lastUntrackedApp?.id === appId) {
    app = lastUntrackedApp;
    sessionData.liveWorkspace.apps.push(app);
    lastUntrackedApp = null;

    console.log(`➕ Added previously untracked app "${app.name}" to workspace`);
  }

  if (!app) {
    console.warn(`❌ Failed to add app to workspace — no app found with id "${appId}"`);
    return;
  }

  // Set as active app if none is active
  if (!sessionData.liveWorkspace.activeAppId) {
    sessionData.liveWorkspace.activeAppId = app.id;
  }

  mainWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  overlayWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  hudWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);

  console.log(`✅ Added "${app.name}" to workspace`);
}

module.exports = {
  saveSession,
  loadSession,
  updateSessionData,
  launchApp,
  startSession,
  startPollingWindowState,
  onWorkspaceChange,
  stopPollingWindowState,
  isAppInWorkspace,
  getSessionData,
  getLiveWorkspace,
  setMainWindow,
  setInitiallyHiddenApps,
  setOverlayWindow,
  setHudWindow,
  removeAppFromWorkspace,
  addAppToWorkspace,
  
  sessionData
};
