const { exec } = require("child_process");

function getActiveChromeTabInfo(callback, delayMs = 300) {
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
        callback(null);
      }
    });
  }, delayMs);
}

function getChromeWindowsAndTabs() {
  return new Promise((resolve) => {
    const script = `
      set output to ""
      tell application "Google Chrome"
        set windowCount to count of windows
        repeat with w from 1 to windowCount
          set win to window w
          set winTitle to title of active tab of win
          set winId to id of win
          set output to output & winId & "[[[" & winTitle & "[[["

          set tabList to ""
          set tabCount to number of tabs in win
          repeat with t from 1 to tabCount
            set tabItem to tab t of win
            set tabTitle to title of tabItem
            set tabURL to URL of tabItem
            set tabActive to (index of active tab of win is equal to t)
            set tabList to tabList & tabTitle & "|||" & tabURL & "|||" & tabActive & "~~~"
          end repeat

          set output to output & tabList & "###"
        end repeat
      end tell
      return output
    `;

    exec(`osascript -e '${script}'`, (err, stdout) => {
      if (err || !stdout) return resolve([]);

      const rawWindows = stdout.trim().split("###").filter(Boolean);
      const result = rawWindows.map(block => {
        const [id, title, tabsRaw] = block.split("[[[");
        const tabs = (tabsRaw || '').split("~~~").filter(Boolean).map(row => {
          const [tabTitle, tabURL, activeFlag] = row.split("|||");
          return {
            id: `tab-${Math.random().toString(36).slice(2)}`,
            title: tabTitle?.trim(),
            url: tabURL?.trim(),
            isActive: activeFlag?.trim() === "true"
          };
        });

        return {
          id: id.trim(),
          title: title.trim(),
          tabs
        };
      });

      resolve(result);
    });
  });
}

module.exports = { getActiveChromeTabInfo, getChromeWindowsAndTabs };