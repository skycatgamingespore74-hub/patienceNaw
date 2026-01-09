require("dotenv").config();
const tmi = require("tmi.js");
const fs = require("fs");
const path = require("path");
const logClock = require("./système/logClock");

// =========================
// ENV
// =========================
const BOT_USERNAME = process.env.BOT_USERNAME;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_NAME = process.env.CHANNEL_NAME;

if (!BOT_USERNAME || !BOT_TOKEN || !CHANNEL_NAME) {
  console.error("❌ BOT_USERNAME, BOT_TOKEN ou CHANNEL_NAME manquant dans le .env");
  process.exit(1);
}

// =========================
// ÉTAT GLOBAL
// =========================
const pauseState = {
  isPaused: false,
  stoppoints: false
};

// =========================
// CONTEXT SYSTÈME
// =========================
const context = {
  platform: "twitch",
  pauseState
};

// =========================
// CLIENT TWITCH
// =========================
const client = new tmi.Client({
  options: { debug: true },
  connection: { secure: true, reconnect: true },
  identity: {
    username: BOT_USERNAME,
    password: BOT_TOKEN
  },
  channels: [CHANNEL_NAME]
});

// =========================
// CHARGEMENT DES SYSTÈMES
// =========================
const systemesPath = path.join(__dirname, "système");
if (fs.existsSync(systemesPath)) {
  fs.readdirSync(systemesPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const systeme = require(path.join(systemesPath, file));
    if (typeof systeme === "function") {
      try {
        systeme(context);
        console.log(`[${logClock.getTime()}] ✅ Système chargé : ${file}`);
      } catch (err) {
        console.error(`[${logClock.getTime()}] ❌ Erreur système ${file}:`, err);
      }
    }
  });
}

// =========================
// CHARGEMENT DES COMMANDES
// =========================
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");

if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const cmd = require(path.join(commandesPath, file));
    if (cmd?.name && typeof cmd.execute === "function") {
      commandes.set(cmd.name, cmd);
      console.log(`[${logClock.getTime()}] ✅ Commande Twitch chargée : !${cmd.name}`);
    }
  });
}

// =========================
// CHARGEMENT DES INTERACTIONS
// =========================
const interactions = [];
const interactionsPath = path.join(__dirname, "interactions");

if (fs.existsSync(interactionsPath)) {
  fs.readdirSync(interactionsPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const interaction = require(path.join(interactionsPath, file));
    if (typeof interaction === "function") {
      interactions.push(interaction);
      console.log(`[${logClock.getTime()}] ✅ Interaction Twitch chargée : ${file}`);
    }
  });
}

// =========================
// CONNEXION TWITCH
// =========================
(async () => {
  try {
    console.log(`[${logClock.getTime()}] ⌛ Connexion Twitch...`);
    await client.connect();
    console.log(`[${logClock.getTime()}] 🟢 Twitch connecté sur ${CHANNEL_NAME}`);
  } catch (err) {
    console.error(`[${logClock.getTime()}] ❌ Connexion Twitch échouée:`, err);
  }
})();

// =========================
// COMMANDES CHAT TWITCH
// =========================
client.on("message", async (channel, tags, message, self) => {
  if (self || !message.startsWith("!")) return;

  const args = message.slice(1).trim().split(/\s+/);
  const name = args.shift().toLowerCase();

  // ⏸️ Pause globale
  if (pauseState.isPaused && name !== "play") {
    client.say(channel, "⏸️ Bot en pause");
    return;
  }

  // ✅ Exécution commande
  const command = commandes.get(name);
  if (command) {
    try {
      await command.execute(client, channel, tags, args, pauseState);
      console.log(
        `[${logClock.getTime()}] ▶️ !${name} exécutée par ${tags["display-name"]}`
      );
    } catch (err) {
      console.error(
        `[${logClock.getTime()}] ❌ Erreur commande !${name}:`,
        err
      );
    }
  }

  // =========================
  // INTERACTIONS
  // =========================
  interactions.forEach(fn => {
    try {
      fn(client, pauseState, channel, tags, message);
    } catch (err) {
      console.error(`[${logClock.getTime()}] ❌ Erreur interaction:`, err);
    }
  });
});

// =========================
// SAFE MODE
// =========================
process.on("unhandledRejection", err =>
  console.error(`[${logClock.getTime()}] 🔥 Unhandled Rejection:`, err)
);

process.on("uncaughtException", err =>
  console.error(`[${logClock.getTime()}] 🔥 Uncaught Exception:`, err)
);

// =========================
// EXPORT
// =========================
module.exports = {
  client,
  pauseState
};