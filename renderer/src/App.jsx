import './App.css'

function App() {

  return (
    <>
      
<button onClick={handleLoad}>Load Session</button>
<button onClick={() => window.electron.openWindow("start-session")}>
  Start Session
</button>


    </>
  )
}



const handleLoad = async () => {
  const session = await window.electron.loadSession();
  console.log("Loaded session:", session);
};


export default App
