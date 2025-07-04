import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import ChatBot from './components/ChatBot';
import './index.css';

function SessionWindow() {
  const [query, setQuery] = useState("");
  const [eventLog, setEventLog] = useState([]);
  const [workspaceActive, setWorkspaceActive] = useState(true);
  const [backgroundHidden, setBackgroundHidden] = useState(true);
  const [autoHideApps, setAutoHideApps] = useState(true);

  // On first mount (session start), clear & hide initial apps, then kick off auto-hide
  useEffect(() => {
    (async () => {
      if (workspaceActive) {
        await window.electron.clearWorkspace?.();
        window.electron.startAutoHide?.();
      }
    })();
  }, []); // run once

  const handleSave = () => {
    window.electron.saveSession();
    setEventLog(prev => [
      ...prev,
      { type: "session_saved", timestamp: new Date().toISOString() }
    ]);
  };

  const handleNewTab = async () => {
    const newTab = await window.electron.chooseApp();
    if (!newTab) return;
    await window.electron.launchApp(newTab.path);
    setEventLog(prev => [
      ...prev,
      {
        type: "new_tab_opened",
        items: [newTab.name || newTab.path],
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    try {
      await window.cortexAPI.appControl("chrome", "openTab", url);
      setEventLog(prev => [
        ...prev,
        { type: "search", items: [q], timestamp: new Date().toISOString() }
      ]);
      setQuery("");
    } catch (err) {
      console.error("❌ Failed to open Chrome tab:", err);
    }
  };

  // Pause / resume the entire workspace
  const toggleWorkspace = async () => {
    if (workspaceActive) {
      // — Turning OFF —
      setWorkspaceActive(false);
      setAutoHideApps(false);
      window.electron.pauseWorkspace?.();
    } else {
      // — Turning ON —
      setWorkspaceActive(true);
      setAutoHideApps(true);
      // 1) clear and initial-hide
      await window.electron.clearWorkspace?.();
      // 2) restart auto-hide loop
      window.electron.startAutoHide?.();
      // 3) restore dock & polling
      window.electron.resumeWorkspace?.();
    }
  };

  // Enable/disable the running auto-hide loop
  const toggleAutoHide = () => {
    if (!workspaceActive) return;
    setAutoHideApps(prev => {
      const next = !prev;
      next
        ? window.electron.startAutoHide?.()
        : window.electron.stopAutoHide?.();
      return next;
    });
  };

  // Show/hide all background apps on demand
  const toggleBackgroundApps = () => {
    if (!workspaceActive) return;
    setBackgroundHidden(prev => {
      const next = !prev;
      next
        ? window.electron.hideBackgroundApps?.()
        : window.electron.showAllApps?.();
      return next;
    });
  };

  return (
    <div className="dashboard-grid">
      <header className="top-bar">
        <h1 style={{ margin: 0 }}>Cortex Workspace</h1>
        <div className="top-controls">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleNewTab}>New Tab</button>
          <button onClick={toggleWorkspace}>
            {workspaceActive ? "Pause Cortex" : "Resume Cortex"}
          </button>
          <button onClick={toggleBackgroundApps} disabled={!workspaceActive}>
            {backgroundHidden ? "Show Background Apps" : "Hide Background Apps"}
          </button>
          <button onClick={toggleAutoHide} disabled={!workspaceActive}>
            {autoHideApps ? "Disable Auto-Hide" : "Enable Auto-Hide"}
          </button>
        </div>
      </header>

      <main className="main-panel">
        <ChatBot />
      </main>

      <aside className="side-panel">
        <h2>Summary</h2>
        <p style={{ color: '#555' }}>(Session summary will appear here...)</p>
      </aside>

      <footer className="bottom-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search in Chrome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '16px',
              width: '300px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </form>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SessionWindow />);
