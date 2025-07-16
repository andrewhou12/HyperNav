
const { ipcMain } = require('electron');
const openai = require('./openaiClient');
const { loadRecentSessionEventLogs, formatEventLogForGPT } = require('./pastSessionLoader');

// === 1. GPT Answering for User Queries ===

async function askGPT({ userInput, currentContext = "", includeContext = true }) {
  let systemPrompt = `You are Cortex, an AI productivity assistant. Respond clearly, briefly, and helpfully.\n\n`;

  if (includeContext) {
    const pastEvents = loadRecentSessionEventLogs(3);
    const formattedPast = formatEventLogForGPT(pastEvents);

    systemPrompt += `User’s recent work timeline:\n${formattedPast}\n\n`;
    systemPrompt += `Current context:\n${currentContext}\n\n`;
    systemPrompt += `If relevant, you may suggest applying your answer to the user’s current workspace.`;
  }

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
  const { userInput, currentContext = "", includeContext = true } = payload;
  try {
    const response = await askGPT({ userInput, currentContext, includeContext });
    return response;
  } catch (err) {
    console.error("❌ GPT handler error:", err);
    throw err;
  }
});

// === 2. Session Summarization ===

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


// === 4. Optional: Centralized Intent Router ===

async function routeUserInput({ userInput, currentContext = "" }) {
  const messages = [
    {
      role: "system",
      content: `You are an intent router for a productivity assistant. 
Decide what the user wants you to do. Return one of:

- "askGPT" — general question, brainstorming, text analysis
- "summarizeSession" — request for session summary
- "interpretCommand" — command like "add Chrome to workspace"

Respond with just the intent.`,
    },
    {
      role: "user",
      content: userInput,
    }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
  });

  return response.choices[0].message.content.trim();
}

ipcMain.handle('handle-user-input', async (event, { userInput, currentContext = "", eventLog = [] }) => {
  try {
    const intent = await routeUserInput({ userInput, currentContext });

    switch (intent) {
      case "askGPT":
        return await askGPT({ userInput, currentContext, includeContext: true });

      case "summarizeSession":
        return await summarizeSession(eventLog);

      case "interpretCommand":
        return await interpretCommand(userInput);

      default:
        return `🤖 Sorry, I didn’t understand what to do with that. (Intent: ${intent})`;
    }
  } catch (err) {
    console.error("❌ handle-user-input error:", err);
    throw err;
  }
});
module.exports = {
  askGPT,
  summarizeSession,
  interpretCommand,
  routeUserInput
};