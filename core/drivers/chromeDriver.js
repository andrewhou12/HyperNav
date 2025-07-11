const { exec, execSync } = require("child_process");
const path = require("path");
const os = require("os");

const chromeSessionProfile = path.join(os.homedir(), ".cortex-chrome-profile");

const chromeDriver = {
  launch: () =>
    exec('open -a "Google Chrome"'),

  openNewWindowWithTab: (url) =>
    exec(
      `open -n -a "Google Chrome" --args --user-data-dir="${chromeSessionProfile}" --new-window "${url}"`,
      (err) => {
        if (err) {
          console.error("❌ Failed to launch Cortex Chrome window:", err.message);
        }
      }
    ),

  // 🔍 Helper: Get PID(s) of Cortex Chrome instance(s)
  getCortexChromePIDs: () => {
    try {
      const result = execSync(`ps -axo pid,command | grep 'Google Chrome' | grep '${chromeSessionProfile}' | grep -v grep | grep -v -- '--type'`).toString();
      const pids = result
        .split('\n')
        .map(line => line.trim().match(/^(\d+)\s+/))
        .filter(Boolean)
        .map(match => match[1]);
console.log(pids);

      return pids;  // Array of PIDs (may be one or multiple)
    } catch (e) {
      return [];
    }
  },

  openTab: (url) => {
    const pids = chromeDriver.getCortexChromePIDs();
    if (pids.length === 0) {
      console.log("⛔ No Cortex Chrome instance found.");
      return;
    }
  
    const pid = pids[0];
    console.log("PID", pid)
   
    exec(`osascript -e 'tell application "System Events"
        set visible of (first process whose unix id is ${pid}) to true
      end tell
  
      tell application "Google Chrome"
        activate
        if (count of windows) is 0 then
          make new window
        end if
        tell front window
          set newTab to make new tab with properties {URL:"https://gmail.com"}
          set active tab index to (index of newTab)
        end tell
      end tell'`,  (err) => {
        if (err) {
          console.error("❌ Failed to launch Cortex Chrome window:", err.message);
        }
      });
  },

  closeActiveTab: () => {
    const pids = chromeDriver.getCortexChromePIDs();
    if (pids.length === 0) {
      console.log("⛔ No Cortex Chrome instance found.");
      return;
    }
    const pid = pids[0];
    exec(`osascript -e '
      tell application "System Events"
        set targetApp to first process whose unix id is ${pid}
      end tell
      tell application "Google Chrome"
        activate
        tell front window
          close active tab
        end tell
      end tell'
    `);
  },

  swapTab: (index) => {
    const pids = chromeDriver.getCortexChromePIDs();
    if (pids.length === 0) {
      console.log("⛔ No Cortex Chrome instance found.");
      return;
    }
    const pid = pids[0];
    exec(`osascript -e '
      tell application "System Events"
        set targetApp to first process whose unix id is ${pid}
      end tell
      tell application "Google Chrome"
        activate
        tell front window
          set active tab index to ${index}
        end tell
      end tell'
    `);
  }
};

module.exports = {
  ...chromeDriver,
  chromeSessionProfile
};
