const { exec } = require("child_process");

function toggleDockAutohide(enable) {
  return new Promise((resolve, reject) => {
    const command = `defaults write com.apple.dock autohide -bool ${enable ? "true" : "false"} && killall Dock`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Failed to toggle dock autohide: ${error.message}`);
        return reject(error);
      }
      console.log(`✅ Dock autohide ${enable ? "enabled" : "disabled"}`);
      resolve();
    });
  });
}

module.exports = {
  toggleDockAutohide
};
