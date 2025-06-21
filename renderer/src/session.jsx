import React from 'react'
import ReactDOM from 'react-dom/client'

function SessionWindow() {
  return (
    <>
      <h1>New Session</h1>
    <button onClick={handleSave}>Save Session</button>

  </>
  )
  
}

const handleSave = () => {
  const dummySession = {
    sessionName: "focus_mvp",
    createdAt: new Date().toISOString(),
    items: [
      {
        type: "app",
        name: "Visual Studio Code",
        path: "/Applications/Visual Studio Code.app",
        windowTitle: "Cortex Dev",
        isActive: true
      }
    ]
  };

  window.electron.saveSession(dummySession);
};

ReactDOM.createRoot(document.getElementById('root')).render(<SessionWindow />);
