let discordClient = null;
let logChannelId = '1459610071179853897';

// Appelé depuis l'index Discord
function initLogs(client, channelId) {
  discordClient = client;
  logChannelId = channelId;
}

// Fonction d'envoi Discord
function sendToDiscord(type, messages) {
  if (!discordClient || !logChannelId) return;

  const channel = discordClient.channels.cache.get(logChannelId);
  if (!channel) return;

  const content = messages
    .map(m => (typeof m === "string" ? m : JSON.stringify(m, null, 2)))
    .join(" ");

  channel.send(`\`\`\`${type}\n${content.slice(0, 1900)}\n\`\`\``)
    .catch(() => {});
}

// --- INTERCEPTION ---
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  sendToDiscord("LOG", args);
};

console.warn = (...args) => {
  originalWarn(...args);
  sendToDiscord("WARN", args);
};

console.error = (...args) => {
  originalError(...args);
  sendToDiscord("ERROR", args);
};

module.exports = {
  initLogs
};