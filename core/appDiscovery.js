const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app, nativeImage } = require('electron');

const iconCacheDir = path.join(app.getPath('userData'), 'app-icons');
if (!fs.existsSync(iconCacheDir)) {
  fs.mkdirSync(iconCacheDir);
}

async function extractIcon(appPath) {
  try {
    const icnsPath = path.join(appPath, 'Contents', 'Resources');
    const files = fs.readdirSync(icnsPath);
    const icnsFile = files.find(file => file.endsWith('.icns'));

    if (!icnsFile) return null;

    const fullIcnsPath = path.join(icnsPath, icnsFile);
    const appNameMatch = appPath.match(/([^/]+)\.app$/);
    const appNameSafe = appNameMatch ? appNameMatch[1].replace(/\s+/g, '_') : 'app';
    const outputPngPath = path.join(iconCacheDir, `${appNameSafe}.png`);

    if (!fs.existsSync(outputPngPath)) {
      await new Promise((resolve, reject) => {
        exec(`sips -s format png "${fullIcnsPath}" --out "${outputPngPath}"`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    const image = nativeImage.createFromPath(outputPngPath);
    return image.toDataURL();

  } catch (err) {
    console.error(`❌ Failed to extract icon for ${appPath}:`, err);
    return null;
  }
}

const isValidAppPath = (appPath) => {
  return (
    appPath.startsWith('/Applications/') ||
    appPath.startsWith('/System/Applications/') ||
    appPath.startsWith(`${process.env.HOME}/Applications/`)
  );
};

async function getInstalledApps() {
  return new Promise((resolve, reject) => {
    exec(`mdfind "kMDItemContentType == 'com.apple.application-bundle'"`, (err, stdout) => {
      if (err) return reject(err);
      const appPaths = stdout.split('\n').filter(Boolean).filter(isValidAppPath);

      const apps = appPaths.map(appPath => {
        const nameMatch = appPath.match(/([^/]+)\.app$/);
        const name = nameMatch ? nameMatch[1] : appPath;
        return { name, path: appPath };  // No icons here (lean)
      });

      resolve(apps);
    });
  });
}

async function getInstalledAppsWithIcons() {
  const apps = await getInstalledApps();
  const appsWithIcons = await Promise.all(apps.map(async (app) => {
    const icon = await extractIcon(app.path);
    return { ...app, icon };
  }));
  return appsWithIcons;
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
  getInstalledAppsWithIcons,
  getRunningApps,
  extractIcon
};
