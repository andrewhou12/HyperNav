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
      t.url &&
      !t.url.startsWith("devtools://") &&
      !t.url.startsWith("chrome-extension://") &&
      !t.url.startsWith("chrome://") &&
      !t.url.startsWith("edge://")
    );

    const result = await Promise.all(
      pages.map(async (target, index) => {
        try {
          const client = await CDP({ target, port: 9222 });
          const { Runtime } = client;

          const titleEval = await Runtime.evaluate({ expression: "document.title" });
          const title = titleEval.result?.value || "";

          const url = target.url;
          const id = target.id || `tab-${index}-${Date.now()}`;
          const isActive = target.attached || false;

          await client.close();

          if (!title || !url || !id) return null;

          const appName = deriveAppNameFromURL(url) || "Unknown";

          return {
            id,
            title,
            url,
            isActive,
            appName,
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


function deriveAppNameFromURL(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return capitalize(parts[parts.length - 2]); // notion.so → Notion
    }
  } catch {}
  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


module.exports = { getActiveChromeTabInfo, getChromeWindowsAndTabs };