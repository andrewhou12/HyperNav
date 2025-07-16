const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null; // fallback if not present
  }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

function getDefaultSettings() {
    return {
      hotkeys: {
        openLauncher: 'Option+Space',
        openNavigator: 'Option+Tab'
      },
      hideCortexHud: false,
      overlayPlacement: 'bottom-right'
    };
  }
module.exports = {
  loadSettings,
  saveSettings,
  settingsPath,
  getDefaultSettings
};
