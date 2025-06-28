import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react'
import SessionSummary from './components/sessionSummary'
import ChatBot from './components/ChatBot' // ✅ make sure this exists

function SessionWindow() {
  const [query, setQuery] = useState("");
  const [eventLog, setEventLog] = useState([]);

  const logEvent = (type, items = []) => {
    const entry = {
      type,
      items,
      timestamp: new Date().toISOString(),
    };
    setEventLog(prev => [...prev, entry]);
  };

  const handleSave = () => {
    window.electron.saveSession();
    logEvent("session_saved");
  };

  const handleNewTab = async () => {
    const newtab = await window.electron.chooseApp();
    if (!newtab) return;
    await window.electron.launchApp?.(newtab.path);
    logEvent("new_tab_opened", [newtab.name || newtab.path]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    try {
      await window.cortexAPI.appControl("chrome", "openTab", searchUrl);
      logEvent("search", [query]);
      setQuery("");
    } catch (err) {
      console.error("❌ Failed to open Chrome tab:", err);
    }
  };

  return (
    <div className="dashboard-grid">
      <header className="top-bar">
        <h1 style={{ margin: 0 }}>New Session</h1>
        <div className="top-controls">
          <button onClick={handleSave}>Save Session</button>
          <button onClick={handleNewTab}>New Tab</button>
        </div>
      </header>

      <main className="main-panel p-4">
  <ChatBot />
</main>
      <aside className="side-panel">
        <h2>Summary</h2>
        <SessionSummary eventLog={eventLog} />
      </aside>

      <footer className="bottom-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search in Chrome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "16px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        </form>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionWindow />
  </StrictMode>,
);
