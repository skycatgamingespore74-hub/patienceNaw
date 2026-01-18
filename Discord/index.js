require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// =========================
// CLIENT DISCORD
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// COMMANDES DISCORD
// =========================
client.commands = new Collection();

// =========================
// LOGS DISCORD
// =========================
let logChannelId = "1459610071179853897";
function sendLogToDiscord(type, message) {
  if (!logChannelId) return;
  if (!client.isReady()) return;

  const channel = client.channels.cache.get(logChannelId);
  if (!channel) return;
  channel
    .send(`\`\`\`${type.toUpperCase()} | ${message}\`\`\``)
    .catch(() => {});
}

// =========================
// HANDLERS
// =========================
require("./handler/commande")(client);
require("./handler/interaction")(client);

// =========================
// READY
// =========================
client.once("clientReady", () => {
  console.log(`🤖 Bot Discord connecté : ${client.user.tag}`);
});

// =========================
// LOGIN
// =========================
client.login(process.env.DISCORD_TOKEN);

// =========================
// EXPORT
// =========================
module.exports = {
  client,
  sendLogToDiscord,
  setLogChannel: id => (logChannelId = id)
};