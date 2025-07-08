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

let autoHideInterval = null;
let prevActiveApp = null;
let previouslyHiddenApps = [];


function recordAndHide(apps) {
  if (!apps.length) return;
  previouslyHiddenApps = Array.from(new Set([...previouslyHiddenApps, ...apps]));
  hideApps(apps);  // your AppleScript helper
}


function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");

      // 1) Hide all windows
      hideApps(apps);

      // 2) Log the workspace_cleared event
      // updateSessionData({
      //   type: 'workspace_cleared',
      //   data: { items: apps }
      // });

//^we will add this back when we actually have a user facing button to clear workspace


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
    if (prevActiveApp && prevActiveApp !== activeApp && !tracked.includes(prevActiveApp)) {
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
  clearWorkspace,
  hideBackgroundApps,
  showAllApps,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace,
  getPreviouslyHiddenApps
};
