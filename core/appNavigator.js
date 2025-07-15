const { execSync } = require("child_process");
const { default: activeWin } = require("active-win");
const chromeDriver = require("./drivers/chromeDriver");
const { sessionData } = require("./sessionManager");
const CDP = require("chrome-remote-interface");

const activateApp = (appName) => {
  try {
    // Use AppleScript to bring app to front
    execSync(`osascript -e 'tell application "${appName}" to activate'`);
    console.log(`✅ Activated app: ${appName}`);
  } catch (err) {
    console.error(`❌ Failed to activate app "${appName}":`, err.message);
  }
};

const activateChromeTabById = async (tabId) => {
    try {
      const targets = await CDP.List({ port: 9222 });
      const target = targets.find(t => t.id === tabId);
  
      if (!target) {
        console.warn("⚠️ Tab not found with given ID.");
        return;
      }
  
      const client = await CDP({ port: 9222 });
      await client.Target.activateTarget({ targetId: target.id });
      await client.close();
  
      console.log(`✅ Activated Chrome tab: ${target.title}`);
    } catch (err) {
      console.error("❌ Failed to activate Chrome tab:", err.message);
    }
  };
const activateNavigatorItem = async (item) => {
    const { type, id, title, parent, activeTab } = item;

    console.log(item);
  
    if (type === 'tab') {
      // It's a Chrome tab — activate Chrome + CDP tab
      await activateApp("Google Chrome");
      await activateChromeTabById(id); // Assuming id === tabId
    } else if (type === 'app') {
      const appName = title || id || "Google Chrome"; // Fallbacks if needed
      await activateApp(appName);
    } else {
      console.warn("❌ Unsupported navigator item type:", type);
    }
  };

const activateByAppId = async (appId, tabId = null) => {
  const app = sessionData.liveWorkspace.apps.find(a => a.id === appId);
  if (!app) {
    console.warn("⚠️ App not found in workspace.");
    return;
  }

  activateApp(app.name);

  if (app.name === 'Google Chrome' && tabId) {
    await activateChromeTabById(tabId);
  }
};

module.exports = {
  activateApp,
  activateChromeTabById,
  activateNavigatorItem,
  activateByAppId
};
