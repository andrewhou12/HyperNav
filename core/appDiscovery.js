const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app, nativeImage } = require('electron');
const { fileIconToBuffer } = require('file-icon');
const os = require('os');


const iconCacheDir = path.join(app.getPath('userData'), 'app-icons');
if (!fs.existsSync(iconCacheDir)) {
  fs.mkdirSync(iconCacheDir);
}

async function extractIcon(appPath) {
  try {
    const appNameSafe = path.basename(appPath, '.app').replace(/\s+/g, '_');
    const outputPngPath = path.join(iconCacheDir, `${appNameSafe}.png`);

    if (fs.existsSync(outputPngPath)) {
      return `file://${outputPngPath}`;
    }

    const buffer = await fileIconToBuffer(appPath, { size: 64 });
    const dataURL = `data:image/png;base64,${buffer.toString('base64')}`;

    fs.writeFileSync(outputPngPath, buffer);

    return dataURL;
  } catch (err) {
    console.error(`❌ Failed to extract icon for ${appPath}:`, err);
    return null;
  }
}

function isValidAppPath(appPath) {
  const allowedDirs = [
    '/Applications',
    '/System/Applications',
    path.join(os.homedir(), 'Applications'),
    path.join(os.homedir(), 'Downloads'), // optional
  ];
  return allowedDirs.some(dir => appPath.startsWith(dir));
}

async function getInstalledApps() {
  return new Promise((resolve, reject) => {
    exec(`mdfind "kMDItemContentType == 'com.apple.application-bundle'"`, async (err, stdout) => {
      if (err) return reject(err);
      const appPaths = stdout.split('\n').filter(Boolean).filter(isValidAppPath);
 
      const apps = await Promise.all(appPaths.map(async (appPath) => {
        const nameMatch = appPath.match(/([^/]+)\.app$/);
        const name = nameMatch ? nameMatch[1] : appPath;
        const icon = await extractIcon(appPath);  
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
  getRunningApps,
  extractIcon
};
