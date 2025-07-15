const { exec, execSync } = require("child_process");
const path = require("path");
const os = require("os");
const CDP = require("chrome-remote-interface");

const chromeSessionProfile = path.join(os.homedir(), ".cortex-chrome-profile");

const CDP_PORT = 9222;

// 🔌 Connect to the first Cortex Chrome target
async function connectToCDP() {
  try {
    const targets = await CDP.List({ port: CDP_PORT });
    const cortexTargets = targets.filter(t => t.title !== '' && t.url !== '' && !t.url.startsWith('devtools://'));
    if (cortexTargets.length === 0) throw new Error("No valid Cortex Chrome targets");

    const client = await CDP({ target: cortexTargets[0], port: CDP_PORT });
    return client;
  } catch (err) {
    console.error("❌ CDP connection error:", err.message);
    throw err;
  }
}

const chromeDriver = {
  getCortexChromePIDs: () => {
    try {
      const result = execSync(`ps -axo pid,command | grep 'Google Chrome' | grep '${chromeSessionProfile}' | grep -v grep | grep -v -- '--type'`).toString();
      const pids = result
        .split('\n')
        .map(line => line.trim().match(/^(\d+)\s+/))
        .filter(Boolean)
        .map(match => match[1]);
      return pids;
    } catch (e) {
      return [];
    }
  },

  async openTab(url) {
    try {
      const target = await CDP.New({ url, port: CDP_PORT });
      console.log("🆕 Created new target:", target);
  
      const client = await CDP({ port: CDP_PORT });
      await client.Target.activateTarget({ targetId: target.id });
  
      await client.close();
      console.log("✅ Opened new tab:", url);
    } catch (err) {
      console.error("❌ Failed to open new tab via CDP:", err.message);
    }
  },

  async closeActiveTab() {
    try {
      const targets = await CDP.List({ port: CDP_PORT });
      const activeTab = targets.find(t => t.type === 'page' && t.url !== '' && !t.url.startsWith('devtools://'));
      if (activeTab) {
        await CDP.Close({ id: activeTab.id, port: CDP_PORT });
        console.log("✅ Closed active tab.");
      } else {
        console.log("⛔ No active tab to close.");
      }
    } catch (err) {
      console.error("❌ Failed to close active tab:", err.message);
    }
  },

  async swapTab(index) {
    try {
      const targets = await CDP.List({ port: CDP_PORT });
      const pages = targets.filter(t =>
        t.type === 'page' &&
        !t.url.startsWith('devtools://') &&
        !t.url.startsWith('chrome-extension://') &&
        !t.url.startsWith('chrome://') &&
        t.url !== 'about:blank'
      );
      if (pages[index]) {
        await CDP.Activate({ targetId: pages[index].id, port: CDP_PORT });
        console.log("✅ Swapped to tab index:", index);
      } else {
        console.log("⛔ Tab index out of range.");
      }
    } catch (err) {
      console.error("❌ Failed to swap tab:", err.message);
    }
  },

  openNewWindowWithTab: (url) => {
    const safeURL = url.replace(/"/g, '\\"');
    const cmd = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --user-data-dir="${chromeSessionProfile}" --remote-debugging-port=${CDP_PORT} --new-window "${safeURL}"`;
    exec(cmd, (err) => {
      if (err) {
        console.error("❌ Failed to launch Chrome with CDP:", err.message);
      } else {
        console.log("✅ Launched new Cortex Chrome window.");
      }
    });
  },

  quitCortexChromeInstances: () => {
    const pids = chromeDriver.getCortexChromePIDs();
    if (!pids || pids.length === 0) {
      console.log("⛔ No Cortex Chrome instance found.");
      return;
    }

    pids.forEach((pid) => {
      exec(`kill -9 ${pid}`, (err) => {
        if (err) {
          console.error(`❌ Failed to kill Chrome PID ${pid}:`, err.message);
        } else {
          console.log(`✅ Killed Chrome PID ${pid}`);
        }
      });
    });
  },
};

module.exports = {
  ...chromeDriver,
  chromeSessionProfile
};
