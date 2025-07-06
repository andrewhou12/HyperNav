// utils/workspaceManager.js
const {
  getOpenApps,
  hideApps,
  showApps,
  getActiveApp
} = require("../utils/applescript");
const {
  getSessionData,
  stopPollingWindowState
} = require("./sessionManager");
const { toggleDockAutohide } = require("./systemUIManager");

let autoHideInterval = null;
let prevActiveApp = null;
let previouslyHiddenApps = [];

// Helper to record & hide in one go
function recordAndHide(apps) {
  if (!apps.length) return;
  // remember them just once
  previouslyHiddenApps = Array.from(new Set([
    ...previouslyHiddenApps,
    ...apps
  ]));
  hideApps(apps);
}

function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");
      // record *all* currently open apps
      recordAndHide(apps);
      getActiveApp(app => {
        prevActiveApp = app;
        resolve(apps);
      });
    });
  });
}

function hideBackgroundApps() {
  getActiveApp((activeApp) => {
    const tracked = (getSessionData().liveWorkspace?.apps || [])
      .map(a => a.name);
    // if we switched away from prevActiveApp, and it’s not in tracked,
    // hide it now (and record that hide)
    if (
      prevActiveApp &&
      prevActiveApp !== activeApp &&
      !tracked.includes(prevActiveApp)
    ) {
      recordAndHide([prevActiveApp]);
    }
    prevActiveApp = activeApp;
  });
}

function showAllApps() {
  // unhide everything we ever hid
  showApps(previouslyHiddenApps);
  // reset for next time
  previouslyHiddenApps = [];
}

function startAutoHide() {
  if (autoHideInterval) return;

  // seed prevActiveApp & hide the first batch
  getActiveApp(app => {
    prevActiveApp = app;
    getOpenApps((apps) => {
      const tracked = (getSessionData().liveWorkspace?.apps || [])
        .map(a => a.name);
      const toHide = apps.filter(a => !tracked.includes(a));
      recordAndHide(toHide);
    });
  });

  autoHideInterval = setInterval(hideBackgroundApps, 3000);
}

function stopAutoHide() {
  clearInterval(autoHideInterval);
  autoHideInterval = null;
  prevActiveApp = null;
}

function pauseWorkspace() {
  stopAutoHide();
  showAllApps();
  toggleDockAutohide(false);
  stopPollingWindowState();
}

function resumeWorkspace() {
  toggleDockAutohide(true);
}

function getPreviouslyHiddenApps() {
  return previouslyHiddenApps;
}

module.exports = {
  clearWorkspace,
  hideBackgroundApps,
  showAllApps,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace,
  getPreviouslyHiddenApps
};
