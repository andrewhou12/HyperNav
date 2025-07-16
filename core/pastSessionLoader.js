// core/pastSessionLoader.js

const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(__dirname, '..', 'sessions');

function loadRecentSessionEventLogs(limit = 3) {
  if (!fs.existsSync(sessionsDir)) return [];

  const files = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(sessionsDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);

  const allEventLogs = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(sessionsDir, file.name), 'utf-8'));
    return data.eventLog || [];
  });

  return allEventLogs.flat();
}

function formatEventLogForGPT(eventLog) {
  
  if (!Array.isArray(eventLog)) {
    console.warn("🛑 formatEventLogForGPT called with invalid eventLog:", eventLog);
    return "No session activity found.";
  }

  return eventLog.map(e => {
    const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const details = e.url
      ? `${e.windowTitle} (${e.url})`
      : e.windowTitle || e.appName || e.type;

    const duration = e.durationMs ? ` [${Math.round(e.durationMs / 1000)} sec]` : '';

    return `${time} → ${details}${duration}`;
  }).join('\n');
}

module.exports = {
  loadRecentSessionEventLogs,
  formatEventLogForGPT,
};