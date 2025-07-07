const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const activeWin = require('active-win');
const { getActiveChromeTabInfo } = require('../utils/chromeTracker');
const { hideApps } = require("../utils/applescript");

const sessionDir = path.join(__dirname, '..', 'sessions');
let sessionData = null;
let pollInterval = null;
let pollingActive = false;
let lastFocus = {};
let mainWindow = null;


function setMainWindow(win) {
  mainWindow = win;
}

function startSession() {
  sessionData = {
    sessionName: `Session_${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    liveWorkspace: {
      apps: [],
      activeAppId: null,
      activeWindowId: null
    },
    eventLog: []
  };
  console.log("🟢 New session started:", sessionData.sessionName);
  startPollingWindowState();

  mainWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
}

function onWorkspaceChange() {
  mainWindow.webContents.send('live-workspace-update', sessionData.liveWorkspace);
}

function getSessionData() {
  return sessionData;
}

function updateSessionData(item) {
  if (!sessionData) return;
  const timestamp = new Date().toISOString();

  if (item.type === "app_opened") {
    const alreadyExists = sessionData.liveWorkspace.apps.some(app => app.path === item.path);
    if (!alreadyExists && item.launchedViaCortex) {
      sessionData.liveWorkspace.apps.push({ ...item, addedAt: timestamp });
    }
  }

  sessionData.eventLog.push({ type: item.type, timestamp, data: item });
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
  const win = await activeWin();
  if (!win) return;

  const { title, owner } = win;
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
}

function startPollingWindowState() {
  if (pollInterval) clearInterval(pollInterval);
  pollingActive = true;
  pollInterval = setInterval(async () => {
    if (!pollingActive) return;
    await pollActiveWindow();
  }, 3000);
}

function stopPollingWindowState() {
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
  stopPollingWindowState,
  isAppInWorkspace,
  getSessionData,
  setMainWindow
};
