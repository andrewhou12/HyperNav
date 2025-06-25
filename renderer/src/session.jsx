import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react'

function SessionWindow() {
  const [query, setQuery] = useState("");

  const handleSave = () => {
    window.electron.saveSession();
  };

  const handleNewTab = async () => {
    const newtab = await window.electron.chooseApp();
    if (!newtab) return;
    window.electron.launchApp?.(newtab.path);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  
    try {
      await window.cortexAPI.appControl("chrome", "openTab", searchUrl);
      setQuery(""); // clears input after successful search
      console.log("✅ Cleared search input");
    } catch (err) {
      console.error("❌ Failed to open Chrome tab:", err);
    }
  };
  

  return (
    <>
      <h1>New Session</h1>
      <button onClick={handleSave}>Save Session</button>
      <button onClick={handleNewTab}>New Tab</button>

      <form onSubmit={handleSearch} style={{ marginTop: "20px" }}>
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionWindow />
  </StrictMode>,
);
