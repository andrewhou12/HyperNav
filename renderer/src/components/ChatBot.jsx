import { useState } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
  
    try {
      console.log("Sending askGPT with:", trimmedInput);
      const result = await window.electron.askGPT({
        userInput: trimmedInput,
        currentContext: "", 
      });
      console.log("Received GPT response:", result);
      setResponse(result);
    } catch (err) {
      console.error("GPT Error:", err);
      setResponse("⚠️ Failed to get response.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
        🗨️ Ask Cortex
      </h2>

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
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.border = "1px solid #666")}
        onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
      />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleAsk}
          style={{
            padding: "10px 16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
          }}
        >
          Ask
        </button>
      </div>

      <div style={{ marginTop: "16px", color: "#333" }}>
        <strong>Cortex will reply here…</strong>
        <p style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{response}</p>
      </div>
    </div>
  );
}