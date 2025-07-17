// utils/workspaceManager.js
const {
  getOpenApps,
  hideApps,
  showApps,
  getActiveApp
} = require("../utils/applescript");
const {
  getSessionData,
  stopPollingWindowState,
  startPollingWindowState
} = require("./sessionManager");
const { toggleDockAutohide } = require("./systemUIManager");
const { updateSessionData } = require('./sessionManager');
const activeWin = require("active-win"); 
const chromeDriver = require("./drivers/chromeDriver"); // contains getCortexChromePIDs()


let autoHideInterval = null;
let prevActiveApp = null;
let previouslyHiddenApps = [];
let initiallyHiddenApps = new Set();
const SELF_APP_NAMES = ['Electron', 'Cortex']; // dev and prod


function setInitiallyHiddenApps(appNames) {
  initiallyHiddenApps = new Set(appNames);
}

function recordAndHide(apps) {
  if (!apps.length) return;
  previouslyHiddenApps = Array.from(new Set([...previouslyHiddenApps, ...apps]));
  hideApps(apps);  // your AppleScript helper
}


function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");

      // 1) Hide all windows and record them
      recordAndHide(apps);

      // 2) Log the workspace_cleared event
      // updateSessionData({
      //   type: 'workspace_cleared',
      //   data: { items: apps }
      // });

      // 3) Seed prevActiveApp for future auto-hide checks
      getActiveApp(app => {
        prevActiveApp = app;
        resolve(apps);
      });
    });
  });
}

function hideBackgroundApps() {
  getActiveApp(activeApp => {
    const tracked = (getSessionData().liveWorkspace?.apps || []).map(a => a.name);
    if (
      prevActiveApp &&
      prevActiveApp !== activeApp &&
      !tracked.includes(prevActiveApp) &&
      !SELF_APP_NAMES.includes(prevActiveApp) // stops hiding cortex
    ) {
      recordAndHide([prevActiveApp]);
    } 
    prevActiveApp = activeApp;
  });
}
function showAllApps() {
  // unhide everything
  showApps(previouslyHiddenApps);
  previouslyHiddenApps = [];
  // log it
  updateSessionData({ type: 'visibility_changed', data: { visible: true } });
}

function startAutoHide() {
  if (autoHideInterval) return;

  // Seed previous active app only
  getActiveApp(app => {
    prevActiveApp = app;
  });

  // Begin polling for background app changes
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

function getPreviouslyHiddenApps() {
  return previouslyHiddenApps;
}

module.exports = {
  setInitiallyHiddenApps,
  clearWorkspace,
  hideBackgroundApps,
  showAllApps,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace,
  getPreviouslyHiddenApps,
  autoHideInterval
};


