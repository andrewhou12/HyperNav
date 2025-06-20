import './App.css'

function App() {

  return (
    <>
      <button onClick={handleSave}>Save Session</button>
<button onClick={handleLoad}>Load Session</button>

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

const handleLoad = async () => {
  const session = await window.electron.loadSession();
  console.log("Loaded session:", session);
};


export default App
