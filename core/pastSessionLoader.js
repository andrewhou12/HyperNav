// core/pastSessionLoader.js
import fs from "fs";
import path from "path";

const sessionsDir = path.join(process.cwd(), "sessions");

export function loadRecentSessionSummaries(limit = 3) {
  const files = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith(".json"))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(sessionsDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);

  const summaries = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(sessionsDir, f.name), "utf-8"));
    const { liveWorkspace, eventLog } = data;

    const appNames = (liveWorkspace?.apps || []).map(app => app.name).join(", ");
    const summaryLine = `Session from ${f.name} involved apps: ${appNames}, events: ${eventLog.length}`;

    return summaryLine;
  });

  return summaries.join("\n");
}
