const { exec } = require("child_process");

function getAppVisibility(app, callback) {
  const cmd = `osascript -e 'tell application "System Events" to get visible of process "${app}"'`;
  exec(cmd, (err, stdout) => {
    if (err) return callback(null);
    callback(stdout.trim() === 'true');
  });
}

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
function hideApps(apps) {
  return Promise.all(
    apps.map(app => {
      return new Promise(resolve => {
        // 1) System Events hide
        exec(
          `osascript -e 'tell application "System Events" to set visible of process "${app}" to false'`,
          err => {
            if (err) {
              console.warn(`⚠️ [${app}] SysEvents hide failed:`, err.message);
            } else {
              console.log(`🔨 [${app}] SysEvents hide sent`);
            }

            // 2) App-level hide fallback
            exec(
              `osascript -e 'tell application "${app}" to hide'`,
              fbErr => {
                if (fbErr) {
                  console.error(`❌ [${app}] app-level hide failed:`, fbErr.message);
                } else {
                  console.log(`🔨 [${app}] app-level hide sent`);
                }

                // 3) Final visibility check
                getAppVisibility(app, finalVisible => {
                  if (finalVisible === false) {
                    console.log(`✅ [${app}] is now hidden.`);
                  } else if (finalVisible === true) {
                    console.error(`❌ [${app}] STILL visible after both attempts!`);
                  } else {
                    console.warn(`⚠️ [${app}] visibility unknown after hide.`);
                  }

                  resolve(); // Always resolve to allow Promise.all to finish
                });
              }
            );
          }
        );
      });
    })
  );
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
  getActiveApp,
  getAppVisibility
};
