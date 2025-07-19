const { app, BrowserWindow } = require('electron');
const url = require('url');
const { saveAuthToken } = require('./core/authManager'); // however you're storing tokens

// Reference to your main window (update this as needed)
let mainWindow;

function handleProtocolRedirect(event, link) {
  console.log('🔗 Deep link received:', link);

  // Parse token from cortex://auth-callback?token=XYZ
  try {
    const parsed = new URL(link);
    const token = parsed.searchParams.get('token');

    if (!token) {
      console.error('❌ No token found in auth callback');
      return;
    }

    console.log('✅ Received auth token from protocol:', token);

    // Optionally validate or decode the token here

    // Store the token securely
    saveAuthToken(token);

    // Notify renderer (mainWindow) that auth succeeded
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('auth-success', token);
    }
  } catch (err) {
    console.error('❌ Error parsing auth URL:', err);
  }
}

app.on('open-url', handleProtocolRedirect);