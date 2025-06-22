const path = require('path');
const fs = require('fs');

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

  const json = JSON.stringify(sessionData, null, 2);
  fs.writeFileSync(sessionFile, json);
  console.log(`✅ Session saved to ${sessionFile}`);
}

// Load the session data from the JSON file
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

// Export these functions so other files can use them
module.exports = {
  saveSession,
  loadSession,
  updateSessionData,
  sessionData
};
