// appDrivers/vscode.js
const { exec } = require("child_process");
const path = require("path");
const os = require("os");

// Use a persistent Cortex profile path (not deleted across sessions)
const cortexVSCodeProfile = path.join(os.homedir(), ".cortex-vscode-profile");

const vscodeDriver = {
  // Launch VS Code with a dedicated Cortex profile
  launch: (workspacePath = "") => {
    const profileArgs = `--user-data-dir="${cortexVSCodeProfile}"`;

    const target = workspacePath ? `"${workspacePath}"` : "";
    const command = `code ${profileArgs} ${target}`;

    exec(command, (err) => {
      if (err) {
        console.error("❌ Failed to launch VS Code:", err.message);
      } else {
        console.log("🚀 Launched Cortex VS Code:", target);
      }
    });
  }
};

module.exports = {
  ...vscodeDriver,
  cortexVSCodeProfile
};
