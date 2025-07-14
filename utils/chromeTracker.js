const CDP = require("chrome-remote-interface");

async function getActiveChromeTabInfo(callback, delayMs = 300) {
  setTimeout(async () => {
    try {
      const targets = await CDP.List({ port: 9222 });
      const activeTab = targets.find(t =>
        t.type === "page" &&
        !t.url.startsWith("devtools://") &&
        t.url !== "about:blank"
      );

      if (!activeTab) return callback(null);

      const client = await CDP({ target: activeTab, port: 9222 });
      const { Runtime } = client;

      const titleResult = await Runtime.evaluate({ expression: "document.title" });
      const urlResult = await Runtime.evaluate({ expression: "window.location.href" });

      const title = titleResult.result.value;
      const url = urlResult.result.value;

      if (url && !url.startsWith("chrome://") && url !== "about:blank") {
        callback({ title, url });
      } else {
        callback(null);
      }

      await client.close();
    } catch (err) {
      console.error("❌ getActiveChromeTabInfo error:", err.message);
      callback(null);
    }
  }, delayMs);
}
async function getChromeWindowsAndTabs() {
  try {
    const targets = await CDP.List({ port: 9222 });
    const pages = targets.filter(t =>
      t.type === "page" &&
      !t.url.startsWith("devtools://")
    );

    const result = await Promise.all(
      pages.map(async (target) => {
        try {
          const client = await CDP({ target, port: 9222 });
          const { Runtime } = client;

          const titleEval = await Runtime.evaluate({ expression: "document.title" });
          const title = titleEval.result.value;

          const url = target.url;
          const isActive = target.attached || false;

          await client.close();

          return {
            id: target.id,
            title: title,
            tabs: [
              {
                id: target.id,
                title: title,
                url: url,
                isActive: isActive
              }
            ]
          };
        } catch (innerErr) {
          console.warn("⚠️ Failed to evaluate target:", target.id, innerErr.message);
          return null;
        }
      })
    );

    return result.filter(Boolean);
  } catch (err) {
    console.error("❌ getChromeWindowsAndTabs error:", err.message);
    return [];
  }
}


module.exports = { getActiveChromeTabInfo, getChromeWindowsAndTabs };