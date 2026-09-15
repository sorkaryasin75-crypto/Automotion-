export const Messages = {
  welcome: (name: string) =>
    `👋 Welcome, **${name}**!\n\nThis is the official Telegram Human Worker Automation Platform.\n` +
    `Use the menu below to start earning rewards by manually solving legitimate verification challenges.`,
  
  unauthorized: '⛔ Unauthorized access.',
  rateLimited: '⏳ Too many requests. Please wait and try again.',
  sessionExpired: '⚠️ Session not found or expired. Please press /start.',
  
  taskDisplayed: (taskId: string, question: string) =>
    `🧩 **NEW TASK**\n\nTask ID: \`${taskId}\`\nQuestion: ${question}\n\n` +
    `Status:\nWAITING FOR HUMAN ANSWER\n\nPlease manually solve the provided challenge.`,
  
  success: (taskId: string, reward: string) =>
    `✅ **TASK SUCCESSFUL**\n\nTask: \`${taskId}\`\nResult: Accepted\nReward: **${reward}**`,
  
  incorrect: (msg?: string) =>
    `❌ **ANSWER NOT ACCEPTED**\n\nReason: ${msg || 'Incorrect answer provided.'}`,
  
  expired:
    `⌛ **TASK EXPIRED**\n\nThis task can no longer be submitted.`,
};
