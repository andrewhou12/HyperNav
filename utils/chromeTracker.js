// utils/chromeTracker.js
const { exec } = require("child_process");

function getActiveChromeTabInfo(callback) {
  const script = `
    tell application "Google Chrome"
      if exists (front window) then
        set tabTitle to title of active tab of front window
        set tabURL to URL of active tab of front window
        return tabTitle & "|||" & tabURL
      end if
    end tell
  `;

  exec(`osascript -e '${script}'`, (err, stdout) => {
    if (err || !stdout) return callback(null);

    const [title, url] = stdout.trim().split("|||");
    if (title && url) {
      callback({ title: title.trim(), url: url.trim() });
    } else {
      callback(null);
    }
  });
}

module.exports = { getActiveChromeTabInfo };
