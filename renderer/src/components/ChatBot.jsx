import { useState } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      const result = await window.electron.askGPT({
        userInput: trimmedInput,
        currentContext: "" // optionally add session context here
      });
      setResponse(result);
    } catch (err) {
      setResponse("⚠️ Failed to get response.");
      console.error("GPT Error:", err);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">🗨️ Ask Cortex</h2>
        <div className="flex flex-col space-y-2">
          <textarea
            placeholder="Ask something about your current work..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div className="flex justify-end">
            <button
              onClick={handleAsk}
              className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-gray-800">
        <strong>Cortex will reply here…</strong>
        <p className="mt-2 whitespace-pre-wrap">{response}</p>
      </div>
    </div>
  );
}
