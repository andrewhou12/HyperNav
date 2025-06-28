import { ipcMain } from "electron";
import openai from "./openaiClient.js";
import { loadRecentSessionSummaries } from "./pastSessionLoader.js";

export async function askGPT({ userInput, currentContext = "", pastSummary = null }) {
  const inputText = userInput?.trim();
  if (!inputText) throw new Error("❌ Missing or invalid user input for GPT");

  const pastContext = pastSummary || loadRecentSessionSummaries();

  console.log("🧠 Composing messages for GPT with:", {
    currentContext,
    pastContext,
    userInput: inputText,
  });

  const messages = [
    {
      role: "system",
      content: `You are a focused, pragmatic productivity assistant. Respond directly and clearly.\nContext: ${currentContext}\nPast: ${pastContext}`,
    },
    {
      role: "user",
      content: inputText,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle("ask-gpt", async (event, payload) => {
  try {
    console.log("💡 Received ask-gpt:", payload);
    const response = await askGPT(payload);
    console.log("💬 GPT raw reply:", response);
    return response;
  } catch (err) {
    console.error("❌ ask-gpt failed:", err.message);
    return "⚠️ GPT failed to respond. Please try again.";
  }
});

// === 2. Session Summarization ===
export async function summarizeSession(eventLog) {
  const formattedLog = eventLog.map(e => `- ${e.type}: ${e.items?.join(", ") || "(no items)"}`).join("\n");

  const messages = [
    {
      role: "system",
      content: "Summarize the user’s activity as a human would. Highlight work themes, focus patterns, and any noticeable shifts.",
    },
    {
      role: "user",
      content: `Here’s what the user has done:\n${formattedLog}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle("summarize-session", async (event, eventLog) => {
  return await summarizeSession(eventLog);
});


// === 3. GPT → Command Interpreter ===
export async function interpretCommand(userText) {
  const messages = [
    {
      role: "system",
      content: "You are an assistant that outputs only a JSON command for actions in an Electron productivity workspace. Example: {\"action\":\"clear_workspace\", \"target\":null}. Valid actions: open_app, close_app, clear_workspace, focus_app, summarize_session",
    },
    {
      role: "user",
      content: userText,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    response_format: "json",
  });

  return JSON.parse(response.choices[0].message.content);
}

ipcMain.handle("interpret-command", async (event, userText) => {
  return await interpretCommand(userText);
});
