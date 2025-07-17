
const { ipcMain } = require('electron');
const openai = require('./openaiClient');
const { loadRecentSessionEventLogs, formatEventLogForGPT } = require('./pastSessionLoader');
const {
  getSessionData,
} = require('./sessionManager');

// === 1. GPT Answering for User Queries ===

async function askGPTWithContext({ userInput, currentContext = "", includeContext = true, chatHistory = [] }) {
  let systemPrompt = `You are Cortex, an AI productivity assistant. Respond clearly, briefly, and helpfully.\n\n`;

  if (includeContext) {
    // Load past saved logs (up to 3 recent sessions)
    const pastEvents = loadRecentSessionEventLogs(3) || [];
  
    // Live session memory
    sessionData = getSessionData();
    const liveEvents = sessionData?.eventLog || [];
  
    // Merge and deduplicate (if needed)
    const combinedEvents = [...pastEvents, ...liveEvents];
  
    console.log("🧠 Combined Event Logs:", combinedEvents);
  
    const formattedPast = formatEventLogForGPT(combinedEvents);

    systemPrompt += `User’s recent work timeline:\n${formattedPast}\n\n`;
    systemPrompt += `Current context:\n${currentContext}\n\n`;
    systemPrompt += `If relevant, you may suggest applying your answer to the user’s current workspace.`;
  }

  // Construct message list
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory, // full conversation history
    { role: "user", content: userInput }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle('ask-gpt-with-context', async (event, payload) => {
  const { userInput, currentContext = "", includeContext = true, chatHistory = [] } = payload;

  try {
    const response = await askGPTWithContext({ userInput, currentContext, includeContext, chatHistory });
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
    model: 'gpt-4-turbo',
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

- "askGPTWithContext" — general question, brainstorming, text analysis using present and past session context
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
    model: 'gpt-4-turbo',
    messages,
  });

  return response.choices[0].message.content.trim();
}
//askgpt from inlineAI


async function askGPT({ messages }) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
  });

  return response.choices[0].message.content;
}

ipcMain.handle('handle-user-input', async (event, { userInput, currentContext = "", eventLog = [] }) => {
  try {
    const intent = await routeUserInput({ userInput, currentContext });

    switch (intent) {
      case "askGPTWithContext":
        return await askGPTWithContext({ userInput, currentContext, includeContext: true });

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

ipcMain.handle('ask-gpt', async (event, payload) => {
  const { messages } = payload;
  try {
    const response = await askGPT({ messages });
    return response;
  } catch (err) {
    console.error("❌ GPT handler error:", err);
    throw err;
  }
});
module.exports = {
  askGPTWithContext,
  askGPT,
  summarizeSession,
  interpretCommand,
  routeUserInput
};