function App() {
  const handleLoad = async () => {
    const session = await window.electron.loadSession();
    console.log("Loaded session:", session);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">Cortex Launcher</h1>
      
      <div className="flex gap-4">
        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary-muted transition"
        >
          Load Session
        </button>

        <button
          onClick={() => {
            console.log("🟢 Start button clicked");
            window.electron.openWindow("start-session");
          }}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground shadow hover:bg-stack-hover transition"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}

export default App;
