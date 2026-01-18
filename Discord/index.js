require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { initLogs } = require("./système/log");

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
// COMMANDES
// =========================
client.commands = new Collection();

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

  // 🔥 INIT DES LOGS UNE SEULE FOIS
  initLogs(client, "1459610071179853897");
});

// =========================
// LOGIN
// =========================
client.login(process.env.DISCORD_TOKEN);

// =========================
// EXPORT
// =========================
module.exports = { client };