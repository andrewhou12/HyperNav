const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const activeWin = require('active-win');
const { getActiveChromeTabInfo, getChromeWindowsAndTabs } = require('../utils/chromeTracker');
const { getOpenApps, hideApps } = require('../utils/applescript');

const sessionDir = path.join(__dirname, '..', 'sessions');
let sessionData = null;
let pollInterval = null;
let pollingActive = false;
let lastFocus = {};
let mainWindow = null;
let overlayWindow = null;
let initiallyHiddenApps = new Set();

function setMainWindow(win) {
  mainWindow = win;
}

function setOverlayWindow(win) {
  overlayWindow = win;
}

function setInitiallyHiddenApps(appNames) {
  initiallyHiddenApps = new Set(appNames);
}

function getSessionData() {
  return sessionData;
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
        id: item.id || `${item.name}-${Date.now()}`,
        name: item.name,
        icon: item.icon || "folder",
        path: item.path,
        windows: []
      };
      sessionData.liveWorkspace.apps.push(newApp);
      mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
      overlayWindow?.webContents.send?.('live-workspace-update', sessionData.liveWorkspace);
      
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
}



function onWorkspaceChange() {
  mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
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
  try {
    const win = await activeWin();
    if (!win) return;

    const { title, owner, id: windowId } = win;
    const appName = owner.name;
    const appPath = owner.path;
    const timestamp = new Date().toISOString();

    // Skip invalid or garbage app names
    if (!appName || appName === 'undefined') {
      console.warn('⚠️ Skipping window — invalid app name:', appName);
      return;
    }

    const event = {
      type: appName === 'Google Chrome' ? 'tab_focus' : 'poll_snapshot',
      timestamp,
      appName,
      windowTitle: title
    };

    sessionData.eventLog.push(event);
    lastFocus = { appName, windowTitle: title, timestamp };

    let matchingApp = sessionData.liveWorkspace.apps.find(app => app.name === appName);
    if (matchingApp) {
      sessionData.liveWorkspace.activeAppId = matchingApp.id;
      sessionData.liveWorkspace.activeWindowId = windowId;

      // Clear active flags
      for (const app of sessionData.liveWorkspace.apps) {
        app.windows = [];
        app.tabs = app.tabs?.map(tab => ({ ...tab, isActive: false })) || [];
      }

      if (appName === 'Google Chrome') {
        try {
          const tabs = await getChromeWindowsAndTabs();

          let chromeApp = sessionData.liveWorkspace.apps.find(app => app.name === 'Google Chrome');

          if (!chromeApp) {
            chromeApp = {
              id: `Google Chrome-${Date.now()}`,
              name: 'Google Chrome',
              path: appPath,
              tabs: []
            };
            sessionData.liveWorkspace.apps.push(chromeApp);
          }

          chromeApp.tabs = tabs;

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
              timestamp
            });
          }
        } catch (err) {
          console.warn("⚠️ Failed to get Chrome tabs:", err);
        }
      }

      mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
    }

    // Add new app if not tracked and not excluded
    if (
      !matchingApp &&
      !initiallyHiddenApps.has(appName) &&
      appName !== "Code"
    ) {
      matchingApp = {
        id: `${appName}-${Date.now()}`,
        name: appName,
        path: appPath || null,
        windows: [],
        tabs: []
      };
      sessionData.liveWorkspace.apps.push(matchingApp);
    }

  } catch (err) {
    console.error("❌ pollActiveWindow error:", err);
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
  setOverlayWindow
};
