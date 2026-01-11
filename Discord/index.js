require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// =========================
// CLIENT
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// =========================
// COMMANDES
// =========================
client.commands = new Collection();

// =========================
// LOGS – INTERCEPTION CONSOLE
// =========================
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// Salon de logs (pour plus tard)
let logChannelId = '1459610071179853897'; // tu pourras le définir avec une commande

function sendLogToDiscord(type, message) {
  if (!logChannelId) return;
  if (!client.isReady()) return;

  const channel = client.channels.cache.get(logChannelId);
  if (!channel) return;

  channel.send(`\`\`\`${type.toUpperCase()} | ${message}\`\`\``)
    .catch(() => {});
}

// log
console.log = (...args) => {
  const msg = args.join(" ");
  originalLog(...args);
  sendLogToDiscord("log", msg);
};

// warn
console.warn = (...args) => {
  const msg = args.join(" ");
  originalWarn(...args);
  sendLogToDiscord("warn", msg);
};

// error
console.error = (...args) => {
  const msg = args.join(" ");
  originalError(...args);
  sendLogToDiscord("error", msg);
};

// =========================
// HANDLERS
// =========================
require("./handler/commande")(client);
require("./handler/interaction")(client);

// =========================
// READY
// =========================
client.once("ready", () => {
  console.log(`🤖 Bot Discord connecté : ${client.user.tag}`);
});

// =========================
// LOGIN
// =========================
client.login(process.env.DISCORD_TOKEN);

// =========================
// EXPORT (important)
// =========================
module.exports = {
  client,
  setLogChannel: (id) => {
    logChannelId = id;
    console.log(`Salon de logs défini : ${id}`);
  }
};