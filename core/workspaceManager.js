// utils/workspaceManager.js (Merged Version)
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const activeWin = require('active-win');
const {
  getOpenApps,
  hideApps,
  showApps,
  getActiveApp
} = require("../utils/applescript");
const { getActiveChromeTabInfo, getChromeWindowsAndTabs } = require('../utils/chromeTracker');
const { toggleDockAutohide } = require("./systemUIManager");

const sessionDir = path.join(__dirname, '..', 'sessions');
let sessionData = null;
let pollInterval = null;
let pollingActive = false;
let lastFocus = {};
let mainWindow = null;
let initiallyHiddenApps = new Set();
let autoHideInterval = null;
let prevActiveApp = null;
let previouslyHiddenApps = [];

function setMainWindow(win) {
  mainWindow = win;
}

function setInitiallyHiddenApps(appNames) {
  initiallyHiddenApps = new Set(appNames);
}

function getSessionData() {
  return sessionData;
}

function updateSessionData(item) {
  if (!sessionData) return;

  const timestamp = new Date().toISOString();
  const entry = { type: item.type, timestamp, data: item };

  if (item.type === "app_opened") {
    const alreadyExists = sessionData.liveWorkspace.apps.some(a => a.path === item.path);
    if (!alreadyExists && item.launchedViaCortex) {
      const newApp = {
        id: item.id || `${item.name}-${Date.now()}`,
        name: item.name,
        icon: item.icon || "folder",
        path: item.path,
        windows: []
      };
      sessionData.liveWorkspace.apps.push(newApp);
      mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
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
  mainWindow?.webContents.send('session-log-entry', entry);
}

function startSession() {
  sessionData = {
    sessionName: `Session_${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    liveWorkspace: { apps: [], activeAppId: null, activeWindowId: null },
    eventLog: []
  };
  console.log("🟢 New session started:", sessionData.sessionName);

  updateSessionData({ type: 'session_started', sessionName: sessionData.sessionName });
  startPollingWindowState();
  startAutoHide();
  toggleDockAutohide(true);
  mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
}

function clearWorkspace() {
  getOpenApps((apps) => {
    if (apps) {
      hideApps(apps);
    }

    if (sessionData && sessionData.liveWorkspace) {
      sessionData.liveWorkspace = {
        apps: [],
        activeAppId: null,
        activeWindowId: null
      };
      mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
    }
  });
}

function recordAndHide(apps) {
  if (!apps.length) return;
  previouslyHiddenApps = Array.from(new Set([...previouslyHiddenApps, ...apps]));
  hideApps(apps);
}

function hideBackgroundApps() {
  getActiveApp(activeApp => {
    const tracked = (getSessionData()?.liveWorkspace?.apps || []).map(a => a.name);
    if (prevActiveApp && prevActiveApp !== activeApp && !tracked.includes(prevActiveApp)) {
      recordAndHide([prevActiveApp]);
    }
    prevActiveApp = activeApp;
  });
}

function showAllApps() {
  showApps(previouslyHiddenApps);
  previouslyHiddenApps = [];
  updateSessionData({ type: 'visibility_changed', data: { visible: true } });
}

function startAutoHide() {
  if (autoHideInterval) return;

  getActiveApp(app => {
    prevActiveApp = app;
    getOpenApps((apps) => {
      const tracked = (getSessionData()?.liveWorkspace?.apps || []).map(a => a.name);
      const toHide = (apps || []).filter(a => !tracked.includes(a));
      recordAndHide(toHide);
    });
  });

  autoHideInterval = setInterval(() => {
    hideBackgroundApps();
  }, 3000);
}

function stopAutoHide() {
  clearInterval(autoHideInterval);
  autoHideInterval = null;
  prevActiveApp = null;
}

function pauseWorkspace() {
  stopAutoHide();
  showApps(previouslyHiddenApps);
  previouslyHiddenApps = [];
  toggleDockAutohide(false);
  stopPollingWindowState();
  updateSessionData({ type: 'session_paused' });
}

function resumeWorkspace() {
  toggleDockAutohide(true);
  startAutoHide();
  clearWorkspace();
  startPollingWindowState();
  updateSessionData({ type: 'session_resumed' });
}

function saveSession() {
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const filename = `session_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(path.join(sessionDir, filename), JSON.stringify(sessionData, null, 2));
  console.log(`✅ Session saved to ${filename}`);
}

function loadSession() {
  return null; // Not implemented
}

function launchApp(appPath) {
  exec(`open "${appPath}"`);
}

async function pollActiveWindow() {
  const win = await activeWin();
  if (!win) return;

  const { title, owner, id: windowId } = win;
  const appName = owner.name;
  const timestamp = new Date().toISOString();
  const event = {
    type: appName === 'Google Chrome' ? 'tab_focus' : 'poll_snapshot',
    timestamp,
    appName,
    windowTitle: title
  };

  sessionData.eventLog.push(event);
  lastFocus = { appName, windowTitle: title, timestamp };

  let matchingApp = sessionData.liveWorkspace.apps.find(app => app.name === appName);

  if (!matchingApp && !initiallyHiddenApps.has(appName)) {
    matchingApp = {
      id: `${appName}-${Date.now()}`,
      name: appName,
      icon: 'folder',
      path: null,
      windows: []
    };
    sessionData.liveWorkspace.apps.push(matchingApp);
  }

  if (matchingApp) {
    sessionData.liveWorkspace.activeAppId = matchingApp.id;
    sessionData.liveWorkspace.activeWindowId = windowId;

    for (const app of sessionData.liveWorkspace.apps) {
      for (const win of app.windows || []) {
        win.isActive = false;
        win.tabs = win.tabs?.map(tab => ({ ...tab, isActive: false })) || [];
      }
    }

    if (appName === 'Google Chrome') {
      const chromeWindows = await getChromeWindowsAndTabs();
      matchingApp.windows = chromeWindows.map(cw => ({
        id: cw.id,
        title: cw.title,
        isActive: cw.id === windowId,
        tabs: cw.tabs.map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          isActive: tab.isActive
        }))
      }));
    }

    mainWindow?.webContents.send('live-workspace-update', sessionData.liveWorkspace);
  }
}

function startPollingWindowState() {
  if (pollInterval) return;
  console.log("🟢 Started polling session state.");
  pollingActive = true;
  pollInterval = setInterval(async () => {
    if (!pollingActive) return;
    await pollActiveWindow();
  }, 3000);
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

function getPreviouslyHiddenApps() {
  return previouslyHiddenApps;
}

module.exports = {
  setMainWindow,
  setInitiallyHiddenApps,
  getSessionData,
  updateSessionData,
  saveSession,
  loadSession,
  startSession,
  clearWorkspace,
  pauseWorkspace,
  resumeWorkspace,
  startAutoHide,
  stopAutoHide,
  hideBackgroundApps,
  showAllApps,
  getPreviouslyHiddenApps,
  startPollingWindowState,
  stopPollingWindowState,
  launchApp,
  isAppInWorkspace
};
