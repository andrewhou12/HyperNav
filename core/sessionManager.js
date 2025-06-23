const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const sessionDir = path.join(__dirname, '..', 'sessions'); // This is a folder
const sessionFile = path.join(sessionDir, 'session.json'); // This is the file

let sessionData = {

    sessionName: "...",
    createdAt: "...",
    items: []

}

function updateSessionData(item) {

    const newItem = {
        ...item,
        addedAt: new Date().toISOString()
      };
      sessionData.items.push(newItem);
      console.log("Item added:", newItem);

}


function saveSession(sessionData) {
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

  sessionData = {

    sessionName: "...",
    createdAt: "...",
    items: []

}

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
  sessionData
};
