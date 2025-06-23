import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react'


function SessionWindow() {

  const handleSave = () => {
    
  
    window.electron.saveSession();

  


  }
  
  const handleNewTab = async () => {
    const newtab = await window.electron.chooseApp();
    if (!newtab) return;
  
    // Optional: launch the app
    window.electron.launchApp?.(newtab.path);
  };
  
  
  
  return (
    <>
      <h1>New Session</h1>
    <button onClick={handleSave}>Save Session</button>
    <button onClick={handleNewTab}>New Tab</button>

  </>
  )
  
}



ReactDOM.createRoot(document.getElementById('root')).render(
<StrictMode>
<SessionWindow />
</StrictMode>,
);
