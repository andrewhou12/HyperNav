const { exec } = require("child_process");

function getActiveChromeTabInfo(callback, delayMs = 300) {
  // Small delay to let Chrome update tab metadata
  setTimeout(() => {
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

      const [title, url] = stdout.trim().split("|||").map((s) => s?.trim());
      const isValid = url && !url.startsWith("chrome://") && url !== "about:blank";

      if (isValid) {
        callback({ title, url });
      } else {
        callback(null); // skip if URL is not meaningful
      }
    });
  }, delayMs);
}

module.exports = { getActiveChromeTabInfo };
