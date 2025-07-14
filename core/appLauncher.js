// core/appLauncher.js

const { exec } = require('child_process');
const { isAppInWorkspace, updateSessionData } = require('./sessionManager');
const { getRunningApps } = require('./appDiscovery');
const chromeDriver = require('./drivers/chromeDriver');
const { chromeSessionProfile } = require('./drivers/chromeDriver');

const MULTI_INSTANCE_APPS = ['Google Chrome', 'Visual Studio Code'];
const CDP_PORT = 9222;

async function smartLaunchApp(appInfo, onStatus = () => {}) {
  const { name, path } = appInfo;
  const runningApps = await getRunningApps();
  const isRunning = runningApps.includes(name);
  const isInWorkspace = isAppInWorkspace(name);

  // Special handling for launching Chrome with CDP support
  const isChrome = name === 'Google Chrome';

  if (isChrome) {
    const launchCmd = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --user-data-dir="${chromeSessionProfile}" --remote-debugging-port=${CDP_PORT}`;

    onStatus({ type: 'info', message: `Launching Chrome (Cortex) with CDP support...` });

    exec(launchCmd, (err) => {
      if (err) {
        onStatus({ type: 'error', message: `Failed to launch Chrome.` });
      } else {
        updateSessionData({
          type: 'app_opened',
          name,
          path,
          windowTitle: name,
          isActive: true,
          launchedViaCortex: true,
        });
        onStatus({ type: 'success', message: `Chrome launched.` });
      }
    });

    return { message: `Chrome launched.` };
  }

  // Launch multi-instance apps with -n
  if (MULTI_INSTANCE_APPS.includes(name)) {
    onStatus({ type: 'info', message: `Launching new ${name} instance...` });
    exec(`open -n "${path}"`, (err) => {
      if (err) {
        onStatus({ type: 'error', message: `Failed to launch ${name}.` });
      } else {
        updateSessionData({
          type: 'app_opened',
          name,
          path,
          windowTitle: name,
          isActive: true,
          launchedViaCortex: true,
        });
        onStatus({ type: 'success', message: `${name} launched.` });
      }
    });
    return { message: `${name} launched.` };
  }

  // Already in workspace
  if (isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already in Cortex workspace.` });
    exec(`osascript -e 'tell application "${name}" to reopen' -e 'tell application "${name}" to activate'`);
    return { message: `${name} is already in workspace.` };
  }

  // Running outside workspace
  if (isRunning && !isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already running outside Cortex. Adding to workspace...` });

    updateSessionData({
      type: 'app_opened',
      name,
      path,
      windowTitle: name,
      isActive: true,
      launchedViaCortex: false,
    });

    exec(`osascript -e 'tell application "${name}" to reopen' -e 'tell application "${name}" to activate'`);
    return { message: `${name} was already running—added to Cortex.` };
  }

  // Default app launch
  onStatus({ type: 'info', message: `Launching ${name}...` });
  exec(`open "${path}"`, (err) => {
    if (!err) {
      updateSessionData({
        type: 'app_opened',
        name,
        path,
        windowTitle: name,
        isActive: true,
        launchedViaCortex: true,
      });
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
    updateSessionData({
      type: 'app_opened',
      name,
      path: '/Applications/Google Chrome.app',
      windowTitle: name,
      isActive: true,
      launchedViaCortex: true,
    });
    return;
  }

  onStatus({ type: 'info', message: `Launching ${name} (Cortex) with search...` });
  chromeDriver.openNewWindowWithTab(searchURL);

  updateSessionData({
    type: 'app_opened',
    name,
    path: '/Applications/Google Chrome.app',
    windowTitle: name,
    isActive: true,
    launchedViaCortex: true,
  });

  onStatus({ type: 'success', message: `${name} launched with search.` });
}

module.exports = {
  smartLaunchApp,
  openChromeWithSearch
};
