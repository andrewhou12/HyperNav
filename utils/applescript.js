const { exec } = require("child_process");

// Returns a list of visible (non-background) application names
function getOpenApps(callback) {
  exec(
    `osascript -e 'tell application "System Events" to get name of (processes where background only is false)'`,
    (error, stdout) => {
      if (error) {
        console.error("Error getting open apps:", error);
        return callback(null);
      }
      const apps = stdout
        .trim()
        .split(", ")
        .map(a => a.trim())
        .filter(a => a);
      callback(apps);
    }
  );
}

// Hide the specified apps via AppleScript
function hideApps(apps) {
  apps.forEach(app => {
    const cmd = `osascript -e 'tell application "System Events" to set visible of process "${app}" to false'`;
    exec(cmd, err => {
      if (err) console.error(`Failed to hide ${app}:`, err);
    });
  });
}

// Show the specified apps via AppleScript
function showApps(apps) {
  apps.forEach(app => {
    const cmd = `osascript -e 'tell application "System Events" to set visible of process "${app}" to true'`;
    exec(cmd, err => {
      if (err) console.error(`Failed to show ${app}:`, err);
    });
  });
}

// Returns the name of the current frontmost (active) application
function getActiveApp(callback) {
  exec(
    `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`,
    (error, stdout) => {
      if (error) {
        console.error("Error getting active app:", error);
        return callback(null);
      }
      callback(stdout.trim());
    }
  );
}

module.exports = {
  getOpenApps,
  hideApps,
  showApps,
  getActiveApp
};
