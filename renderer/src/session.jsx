import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react'


function SessionWindow() {

  const handleSave = () => {
    
  
    window.electron.saveSession();

  


  }
  
  const handleNewTab = () => {


    const dummyTab = {
      type: "app",
    name: "Chrome",
    path: "/Applications/Google Chrome.app",
    windowTitle: "Inbox",
    isActive: true
    };

  window.electron.updateSessionData(dummyTab)

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
