// scripts/self-sign.js
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
  const appPath = context.appOutDir + '/' + context.packager.appInfo.productFilename + '.app';
  console.log(`🔏 Self-signing ${appPath}`);

  try {
    execSync(`codesign --deep --force --sign - "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Self-signing complete');
  } catch (err) {
    console.error('❌ Failed to self-sign app:', err);
  }
};