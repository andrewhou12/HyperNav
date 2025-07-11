const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const sharp = require('sharp');

const cacheDir = path.join(app.getPath('userData'), 'app-icons');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

function extractIcon(appPath, appName) {
  const iconPath = `${appPath}/Contents/Resources/AppIcon.icns`;
  const cachedIconPath = path.join(cacheDir, `${appName}.png`);

  if (fs.existsSync(cachedIconPath)) {
    return `file://${cachedIconPath}`;
  }

  if (fs.existsSync(iconPath)) {
    try {
      const icnsBuffer = fs.readFileSync(iconPath);
      return sharp(icnsBuffer)
        .resize(64, 64)
        .png()
        .toFile(cachedIconPath)
        .then(() => `file://${cachedIconPath}`)
        .catch(() => null);
    } catch (err) {
      console.error('Icon extraction failed:', err);
      return null;
    }
  }

  return null;
}

function getInstalledApps() {
  return new Promise((resolve, reject) => {
    exec(`mdfind "kMDItemContentType == 'com.apple.application-bundle'"`, async (err, stdout) => {
      if (err) return reject(err);
      const appPaths = stdout.split('\n').filter(Boolean);
      const apps = await Promise.all(appPaths.map(async (appPath) => {
        const nameMatch = appPath.match(/([^/]+)\.app$/);
        const name = nameMatch ? nameMatch[1] : appPath;
        const icon = await extractIcon(appPath, name) || null;
        return { name, path: appPath, icon };
      }));
      resolve(apps);
    });
  });
}

function getRunningApps() {
  return new Promise((resolve, reject) => {
    exec(`osascript -e 'tell application "System Events" to get the name of every process whose background only is false'`, (err, stdout) => {
      if (err) return reject(err);
      const runningAppNames = stdout.split(',').map(name => name.trim()).filter(Boolean);
      resolve(runningAppNames);
    });
  });
}

module.exports = {
  getInstalledApps,
  getRunningApps
};
