require("dotenv").config();
const tmi = require("tmi.js");
const fs = require("fs");
const path = require("path");

// =========================
// PROTECTION ANTI-DOUBLON
// =========================
if (global.__TWITCH_STARTED__) return;
global.__TWITCH_STARTED__ = true;

// =========================
// ENV
// =========================
const BOT_USERNAME = process.env.BOT_USERNAME;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_NAME = process.env.CHANNEL_NAME;
if (!BOT_USERNAME || !BOT_TOKEN || !CHANNEL_NAME) {
  console.error("❌ BOT_USERNAME, BOT_TOKEN ou CHANNEL_NAME manquant");
  process.exit(1);
}

// =========================
// CLIENT TWITCH
// =========================
const client = new tmi.Client({
  options: { debug: true },
  connection: { secure: true, reconnect: true },
  identity: { username: BOT_USERNAME, password: BOT_TOKEN },
  channels: [CHANNEL_NAME]
});

// =========================
// COMMANDES TWITCH
// =========================
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;
    try {
      const cmd = require(path.join(commandesPath, file));
      if (cmd?.name && typeof cmd.execute === "function") {
        commandes.set(cmd.name.toLowerCase(), cmd);
        console.log(`[TWITCH] ✅ Commande twitch chargée !${cmd.name}`);
      }
    } catch (err) {
      console.error(`❌ Erreur commande ${file}:`, err);
    }
  });
}

// =========================
// INTERACTIONS TWITCH
// =========================
const interactions = [];
const interactionsPath = path.join(__dirname, "interactions");
if (fs.existsSync(interactionsPath)) {
  fs.readdirSync(interactionsPath).forEach(file => {
    if (!file.endsWith(".js")) return;
    try {
      const interaction = require(path.join(interactionsPath, file));
      if (typeof interaction === "function") interactions.push(interaction);
    } catch {}
  });
}

// =========================
// CONNEXION TWITCH
// =========================
(async () => {
  try {
    await client.connect();
    console.log(`🟢 Twitch connecté sur ${CHANNEL_NAME}`);
  } catch (err) {
    console.error("❌ Connexion Twitch échouée", err);
  }
})();

// =========================
// CHAT TWITCH
// =========================
const pauseState = { isPaused: false, stoppoints: false };
client.removeAllListeners("message");
client.on("message", async (channel, tags, message, self) => {
  if (self || !message.startsWith("!")) return;
  const args = message.slice(1).trim().split(/\s+/);
  const name = args.shift().toLowerCase();
  if (pauseState.isPaused && name !== "play") return;

  const command = commandes.get(name);
  if (!command) return;
  try {
    await command.execute(client, channel, tags, args, pauseState);
    console.log(`▶️ !${name} par ${tags["display-name"]}`);
  } catch (err) {
    console.error(`❌ Erreur commande !${name}:`, err);
  }
});

// =========================
// EXPORT
// =========================
module.exports = { client, pauseState };