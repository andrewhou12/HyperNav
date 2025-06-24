const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const sessionDir = path.join(__dirname, '..', 'sessions'); // This is a folder
const sessionFile = path.join(sessionDir, 'session.json'); // This is the file

let sessionData; 


function startsession() {

  sessionData = {
    sessionName: `Session_${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),

    liveWorkspace: {
      apps: [],               // List of currently active/tracked apps
      activeAppId: null,      // ID of currently focused app
      activeWindowId: null    // ID of currently focused window
    },

    eventLog: []              // Timeline of user actions
  };

  console.log("🟢 New session started:", sessionData.sessionName);
}

function updateSessionData(item) {
  if (!sessionData) {
    console.error("❌ sessionData is not initialized");
    return;
  }

  const timestamp = new Date().toISOString();

  switch (item.type) {
    case "app_opened": {
      const { name, path, windowTitle, isActive } = item;

      const alreadyExists = sessionData.liveWorkspace.apps.some(app => app.path === path);
      if (!alreadyExists) {
        sessionData.liveWorkspace.apps.push({ name, path, windowTitle, isActive, addedAt: timestamp });
      }

      sessionData.liveWorkspace.activeAppId = path;
      sessionData.liveWorkspace.activeWindowId = windowTitle;

      sessionData.eventLog.push({ type: "app_opened", timestamp, data: item });
      break;
    }

    case "app_closed": {
      const { path } = item;
      sessionData.liveWorkspace.apps = sessionData.liveWorkspace.apps.filter(app => app.path !== path);
      sessionData.eventLog.push({ type: "app_closed", timestamp, data: item });
      break;
    }

    case "app_switched": {
      const { path, windowTitle } = item;
      sessionData.liveWorkspace.activeAppId = path;
      sessionData.liveWorkspace.activeWindowId = windowTitle;
      sessionData.eventLog.push({ type: "app_switched", timestamp, data: item });
      break;
    }

    // Add more event types here...

    default:
      console.warn("⚠️ Unknown session update type:", item.type);
  }

  console.log("✅ Updated session with:", item.type);
}



function saveSession() {
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const timestamp = new Date().toISOString()
    .replace(/T/, '_')       // Replace 'T' with '_'
    .replace(/:/g, '-')      // Replace colons with hyphens (valid for filenames)
    .replace(/\..+/, '');    // Remove milliseconds and 'Z'

const filename = `session_${timestamp}.json`;
const filepath = path.join(sessionDir, filename);


  const json = JSON.stringify(sessionData, null, 2);
  fs.writeFileSync(filepath, json);
  console.log(`✅ Session saved to ${filepath}`);


}

// Load the session data from the JSON file, need to update this 
function loadSession() {
  if (!fs.existsSync(sessionFile)) {
    console.warn('⚠️ No session file found.');
    return null;
  }

  const raw = fs.readFileSync(sessionFile, 'utf-8');
  const data = JSON.parse(raw);
  console.log(`📂 Loaded session from ${sessionFile}`);
  return data;
}


function launchApp(appPath) {
  // Escape spaces properly
  const escapedPath = `"${appPath}"`;
  exec(`open ${escapedPath}`, (error) => {
    if (error) {
      console.error(`Failed to launch app: ${error}`);
    } else {
      console.log(`🚀 Launched app: ${appPath}`);
    }
  });
}


// Export these functions so other files can use them
module.exports = {
  saveSession,
  loadSession,
  updateSessionData,
  launchApp,
  startsession,
  sessionData
};
