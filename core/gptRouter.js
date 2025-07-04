// core/gptRouter.js

const { ipcMain } = require('electron');
const openai = require('./openaiClient');
const { loadRecentSessionEventLogs, formatEventLogForGPT } = require('./pastSessionLoader');

// === 1. GPT Answering for User Queries ===
async function askGPT({ userInput, currentContext = "" }) {
  const pastEvents = loadRecentSessionEventLogs(3);
  const formattedPast = formatEventLogForGPT(pastEvents);

  const systemPrompt = `
You are Cortex, an AI productivity assistant.

Here is the user's recent work timeline:
${formattedPast}

Current context:
${currentContext}

Respond clearly, briefly, and in a focused tone.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userInput }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle('ask-gpt', async (event, payload) => {
  try {
    const response = await askGPT(payload);
    return response;
  } catch (err) {
    console.error("❌ GPT handler error:", err);
    throw err;
  }
});

// === 2. Session Summarization ===

//not using this yet
async function summarizeSession(eventLog) {
  const formattedLog = formatEventLogForGPT(eventLog);

  const messages = [
    {
      role: "system",
      content: "Summarize the user's session activity chronologically, including focus changes, major tasks, and time patterns.",
    },
    {
      role: "user",
      content: `Here’s the session log:\n${formattedLog}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle('summarize-session', async (event, eventLog) => {
  return await summarizeSession(eventLog);
});

// === 3. Command Interpretation ===

//also not using this yet

async function interpretCommand(userText) {
  const messages = [
    {
      role: "system",
      content: "You are a command interpreter for a productivity workspace. Return only valid JSON commands.",
    },
    {
      role: "user",
      content: userText,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    response_format: "json",
  });

  return JSON.parse(response.choices[0].message.content);
}

ipcMain.handle('interpret-command', async (event, userText) => {
  return await interpretCommand(userText);
});

module.exports = {
  askGPT,
  summarizeSession,
  interpretCommand
};