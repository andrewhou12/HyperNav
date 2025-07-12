// core/appLauncher.js

const { exec } = require('child_process');
const { isAppInWorkspace, updateSessionData } = require('./sessionManager');
const { getRunningApps } = require('./appDiscovery');
const chromeDriver = require('./drivers/chromeDriver');

const MULTI_INSTANCE_APPS = ['Google Chrome', 'Visual Studio Code'];

async function smartLaunchApp(appInfo, onStatus = () => {}) {
  const { name, path } = appInfo;
  const runningApps = await getRunningApps();
  const isRunning = runningApps.includes(name);
  const isInWorkspace = isAppInWorkspace(name);

  if (MULTI_INSTANCE_APPS.includes(name)) {
    onStatus({ type: 'info', message: `Launching new ${name} instance...` });
    exec(`open -n "${path}"`, (err) => {
      if (err) {
        onStatus({ type: 'error', message: `Failed to launch ${name}.` });
      } else {
        // updateSessionData({
        //   type: 'app_opened',
        //   name,
        //   path,
        //   windowTitle: name,
        //   isActive: true,
        //   launchedViaCortex: true,
        // });
        onStatus({ type: 'success', message: `${name} launched.` });
      }
    });
    return { message: `${name} launched.` };
  }

  if (isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already in Cortex workspace.` });
    exec(`osascript -e 'tell application "${name}" to reopen' -e 'tell application "${name}" to activate'`);
    return { message: `${name} is already in workspace.` };
  }

  if (isRunning && !isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already running outside Cortex. Adding to workspace...` });

    // updateSessionData({
    //   type: 'app_opened',
    //   name,
    //   path,
    //   windowTitle: name,
    //   isActive: true,
    //   launchedViaCortex: false,
    // });

    exec(`osascript -e 'tell application "${name}" to reopen' -e 'tell application "${name}" to activate'`);
    return { message: `${name} was already running—added to Cortex.` };
  }

  onStatus({ type: 'info', message: `Launching ${name}...` });
  exec(`open "${path}"`, (err) => {
    if (!err) {
      onStatus({ type: 'success', message: `${name} launched.` });
    } else {
      onStatus({ type: 'error', message: `Failed to launch ${name}.` });
    }
  });
  return { message: `${name} launched.` };
}

async function openChromeWithSearch(query, onStatus = () => {}) {
  const name = 'Google Chrome';
  const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  // 🔍 Check if a Cortex Chrome instance (with correct user-data-dir) is running
  const cortexPIDs = chromeDriver.getCortexChromePIDs();
  const hasActiveCortexChrome = cortexPIDs.length > 0;

  if (hasActiveCortexChrome) {
    onStatus({ type: 'info', message: `${name} (Cortex) is already running. Opening tab...` });
    chromeDriver.openTab(searchURL);
    return;
  } else {
    onStatus({ type: 'info', message: `Launching ${name} (Cortex) with search...` });
    chromeDriver.openNewWindowWithTab(searchURL);
    return;
  }


  // updateSessionData({
  //   type: 'app_opened',
  //   name,
  //   path,
  //   windowTitle: name,
  //   isActive: true,
  //   launchedViaCortex: true,
  // });

  onStatus({ type: 'success', message: `${name} launched with search.` });
}

module.exports = {
  smartLaunchApp,
  openChromeWithSearch
};
