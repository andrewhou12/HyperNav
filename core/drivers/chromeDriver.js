const { exec } = require("child_process");
const path = require("path");
const os = require("os");

// 📁 Store Cortex-specific Chrome data persistently
const chromeSessionProfile = path.join(os.homedir(), ".cortex-chrome-profile");

const chromeDriver = {
  launch: () => exec('open -a "Google Chrome"'),

  // ✅ Launch Chrome with persistent Cortex profile
  openNewWindowWithTab: (url) =>
    exec(
      `open -n -a "Google Chrome" --args --user-data-dir="${chromeSessionProfile}" --new-window "${url}"`,
      (err) => {
        if (err) {
          console.error("❌ Failed to launch clean Chrome window:", err.message);
        }
      }
    ),

  openTab: (url) =>
    exec(`osascript -e '
      tell application "Google Chrome"
        tell front window
          set newTab to make new tab with properties {URL:"${url}"}
          set active tab index to (index of newTab)
        end tell
        activate
      end tell'`),

  closeActiveTab: () =>
    exec(`osascript -e '
      tell application "Google Chrome"
        close active tab of front window
      end tell'`),

  swapTab: (index) =>
    exec(`osascript -e '
      tell application "Google Chrome"
        set active tab index of front window to ${index}
      end tell'`)
};

module.exports = {
  ...chromeDriver,
  chromeSessionProfile
};
