const { getOpenApps, hideApps, showApps, getActiveApp } = require("../utils/applescript");
const { getSessionData, stopPollingWindowState } = require("./sessionManager");
const { toggleDockAutohide } = require("./systemUIManager");

let autoHideInterval = null;
let prevActiveApp = null;

// When re-enabling auto-hide, also sweep all non-workspace apps
function hideNonWorkspaceApps() {
  getOpenApps((apps) => {
    if (!apps) return console.log("❗ No apps returned, skipping full hide.");
    const tracked = (getSessionData().liveWorkspace?.apps || []).map(a => a.name);
    const toHide = apps.filter(app => !tracked.includes(app));
    if (toHide.length) {
      console.log("🔒 Hiding non-workspace apps:", toHide);
      hideApps(toHide);
    }
  });
}

function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");
      console.log("🔒 Initial hide:", apps);
      hideApps(apps);
      // seed prevActiveApp
      getActiveApp(app => {
        prevActiveApp = app;
        resolve(apps);
      });
    });
  });
}

function hideBackgroundApps() {
  console.log("🕒 hideBackgroundApps tick");
  getActiveApp((activeApp) => {
    console.log("    prevActiveApp:", prevActiveApp, "activeApp:", activeApp);
    if (!activeApp) return console.log("❗ Could not get active app.");
    const tracked = (getSessionData().liveWorkspace?.apps || []).map(a => a.name);
    if (
      prevActiveApp &&
      prevActiveApp !== activeApp &&
      !tracked.includes(prevActiveApp)
    ) {
      console.log("🔒 Hiding app:", prevActiveApp);
      hideApps([prevActiveApp]);
    }
    prevActiveApp = activeApp;
  });
}

function showAllApps() {
  getOpenApps((apps) => {
    if (!apps) return console.log("❗ No apps returned, skipping show.");
    console.log("🔓 Showing all apps.");
    showApps(apps);
  });
}

function startAutoHide() {
  console.log("▶ startAutoHide called");
  if (autoHideInterval) return;
  // reseed and sweep existing non-workspace
  getActiveApp(app => {
    prevActiveApp = app;
    hideNonWorkspaceApps();
  });
  autoHideInterval = setInterval(hideBackgroundApps, 3000);
}

function stopAutoHide() {
  if (autoHideInterval) {
    clearInterval(autoHideInterval);
    autoHideInterval = null;
    prevActiveApp = null;
  }
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

module.exports = {
  clearWorkspace,
  hideBackgroundApps,
  showAllApps,
  startAutoHide,
  stopAutoHide,
  pauseWorkspace,
  resumeWorkspace,
};
