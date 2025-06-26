const { exec } = require("child_process");

function getOpenApps(callback) {
  exec(
    `osascript -e 'tell application "System Events" to get name of (processes where background only is false)'`,
    (error, stdout) => {
      if (error) {
        console.error("Error getting open apps:", error);
        callback(null);
        return;
      }
      const apps = stdout
        .split(", ")
        .map((a) => a.trim())
        .filter(
          (a) => a !== "Finder" && a !== "Cortex" // Skip system & self
        );
      callback(apps);
    }
  );
}

function hideApps(apps) {
    for (const app of apps) {
      const command = `osascript -e 'tell application "System Events" to set visible of process "${app}" to false'`;
      console.log("Running:", command);
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Failed to hide ${app}:`, err.message);
        }
      });
    }
  }

module.exports = {
  getOpenApps,
  hideApps
};
