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
          (a) => a !== "Cortex" // Skip system & self
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

  function showApps(apps) {
    console.log("🔁 Attempting to show apps:", apps); // ✅ Add this line
  
    for (const app of apps) {
      const command = `osascript -e 'tell application "System Events" to set visible of process "${app}" to true'`;
      console.log("📤 Running:", command); // ✅ See the exact command
      exec(command, (err) => {
        if (err) {
          console.error(`❌ Failed to show ${app}:`, err.message);
        }
      });
    }
  }
  

module.exports = {
  getOpenApps,
  hideApps,
  showApps
};
