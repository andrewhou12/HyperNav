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
    return;
  }

  if (isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already in Cortex workspace.` });
    exec(`osascript -e 'tell application "${name}" to activate'`);
    return;
  }

  if (isRunning && !isInWorkspace) {
    onStatus({ type: 'warning', message: `${name} is already running outside Cortex. Press ⏎ to bring it in.` });
    return;
  }

  onStatus({ type: 'info', message: `Launching ${name}...` });
  exec(`open "${path}"`, (err) => {
    if (!err) {
      // updateSessionData({
      //   type: 'app_opened',
      //   name,
      //   path,
      //   windowTitle: name,
      //   isActive: true,
      //   launchedViaCortex: true,
      // });
      onStatus({ type: 'success', message: `${name} launched.` });
    } else {
      onStatus({ type: 'error', message: `Failed to launch ${name}.` });
    }
  });
}

async function openChromeWithSearch(query, onStatus = () => {}) {

console.log('hello, I am running');

  const name = 'Google Chrome';
  const path = '/Applications/Google Chrome.app';
  const runningApps = await getRunningApps();
  const isRunning = runningApps.includes(name);
  const isInWorkspace = isAppInWorkspace(name);

  const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  if (isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is already in Cortex workspace. Opening search...` });
    chromeDriver.openTab(searchURL);
    return;
  }

  if (isRunning && !isInWorkspace) {
    onStatus({ type: 'info', message: `${name} is running outside Cortex. Opening search...` });
    chromeDriver.openTab(searchURL);
    return;
  }

  onStatus({ type: 'info', message: `Launching ${name} with search...` });
  chromeDriver.openNewWindowWithTab(searchURL);

  console.log('this is running');

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
  openChromeWithSearch,
};
