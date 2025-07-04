import { useEffect, useState } from "react";

function SessionSummary({ eventLog }) {
  const [summary, setSummary] = useState("Generating summary...");

  const getSummary = async () => {
    if (!eventLog || eventLog.length === 0) return;
    const result = await window.electron.summarizeSession(eventLog);
    setSummary(result);
  };

  useEffect(() => {
    getSummary(); // Run once on mount
  }, []);

  return (
    <div className="rounded-xl p-4 border bg-white shadow">
      <h2 className="text-lg font-semibold mb-2">🧠 Live Session Summary</h2>

      <p className="text-gray-700 whitespace-pre-wrap min-h-[100px]">{summary}</p>

      <button
        onClick={getSummary}
        className="mt-4 px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
      >
        🔄 Refresh Summary
      </button>
    </div>
  );
}

export default SessionSummary;
