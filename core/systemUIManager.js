const { exec } = require("child_process");

function toggleDockAutohide(enable) {
  return new Promise((resolve, reject) => {
    const command = `defaults write com.apple.dock autohide -bool ${enable ? "true" : "false"} && defaults write com.apple.dock autohide-delay -float 0 && defaults write com.apple.dock autohide-time-modifier -float 0.1 && killall Dock`;

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
