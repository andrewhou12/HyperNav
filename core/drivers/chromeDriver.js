const { exec } = require("child_process");

const chromeDriver = {
  launch: () => exec('open -a "Google Chrome"'),
  openTab: (url) => exec(`osascript -e '
    tell application "Google Chrome"
      tell front window
        set newTab to make new tab with properties {URL:"${url}"}
        set active tab index to (index of newTab)
      end tell
    end tell'`),
    
  closeActiveTab: () => exec(`osascript -e '
    tell application "Google Chrome"
      close active tab of front window
    end tell'`),
    
    swapTab: (index) => exec(`osascript -e '
      tell application "Google Chrome"
        set active tab index of front window to ${index}
      end tell'`)
    
};

module.exports = chromeDriver;
