const { getOpenApps, hideApps, showApps, getActiveApp } = require("../utils/applescript");
const { getSessionData, stopPollingWindowState, startSession } = require("./sessionManager");
const { toggleDockAutohide } = require("./systemUIManager");

let autoHideInterval = null;
let prevActiveApp = null;
let previouslyHiddenApps = [];

function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");
      hideApps(apps);
      getActiveApp(app => {
        prevActiveApp = app;
        resolve(apps);
      });
    });
  });
}

function hideBackgroundApps() {
  getActiveApp((activeApp) => {
    const tracked = (getSessionData().liveWorkspace?.apps || []).map(a => a.name);
    if (prevActiveApp && prevActiveApp !== activeApp && !tracked.includes(prevActiveApp)) {
      hideApps([prevActiveApp]);
    }
    prevActiveApp = activeApp;
  });
}

function showAllApps() {
  showApps(previouslyHiddenApps);
}

function startAutoHide() {
  if (autoHideInterval) return;
  getActiveApp(app => {
    prevActiveApp = app;
    getOpenApps((apps) => {
      const tracked = (getSessionData().liveWorkspace?.apps || []).map(a => a.name);
      const toHide = apps.filter(app => !tracked.includes(app));
      hideApps(toHide);
      previouslyHiddenApps = [...new Set([...previouslyHiddenApps, ...toHide])];
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
