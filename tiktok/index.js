require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");

const tiktokState = require("../shared/tiktokStatus");
const { sendLogToDiscord } = require("../Discord/index");

// =========================
// ENV
// =========================
const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

// =========================
// PROTECTION ANTI-DOUBLON
// =========================
let isConnecting = false;
let isConnected = false;
let tiktok = null;

// =========================
// ÉTAT & COMMANDES
// =========================
const pauseState = { isPaused: false, stoppoints: false };
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");

// =========================
// HEURE SIMPLE
// =========================
function getTime() {
  return new Date().toLocaleString();
}

// =========================
// LOGS TIKTOK
// =========================
function logTikTok(message) {
  const logMessage = `[TikTok] ${message}`;
  console.log(logMessage); // Affiche dans Node
  sendLogToDiscord("tiktok", message); // Envoie sur Discord
}

// =========================
// CHARGEMENT COMMANDES TIKTOK
// =========================
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const cmd = require(path.join(commandesPath, file));
      if (cmd?.name && typeof cmd.execute === "function") {
        commandes.set(cmd.name.toLowerCase(), cmd);
        logTikTok(`✅ Commande TikTok chargée : ${cmd.name}`);
      }
    } catch (err) {
      logTikTok(`❌ Erreur commande ${file}: ${err.message}`);
    }
  });
}

// =========================
// CONNEXION TIKTOK
// =========================
async function connectTikTok() {
  if (isConnecting || isConnected) {
    logTikTok("⚠️ TikTok déjà connecté ou en cours de connexion");
    return;
  }

  isConnecting = true;
  logTikTok("⌛ Connexion TikTok...");

  tiktok = new WebcastPushConnection(TIKTOK_UNIQUE_ID);

  // Connexion établie
  tiktok.on("connected", () => {
    isConnected = true;
    isConnecting = false;
    tiktokState.isConnected = true;
    logTikTok("🟢 TikTok connecté");
  });

  // Déconnexion
  tiktok.on("disconnected", () => {
    isConnected = false;
    isConnecting = false;
    tiktokState.isConnected = false;
    logTikTok("🔴 TikTok déconnecté");

    if (tiktokState.shouldRun !== false) {
      setTimeout(connectTikTok, 10_000); // Reconnexion auto
    }
  });

  // Messages TikTok
  tiktok.on("chat", data => {
    if (!data?.uniqueId || !data?.comment) return;

    const username = data.uniqueId;
    const message = data.comment.trim();
    tiktokState.lastMessageTimestamp = Date.now();

    // Affiche TOUS les messages dans Node et Discord
    logTikTok(`${username}: ${message}`);

    // Vérifie si c'est une commande
    if (message.startsWith("!")) {
      const args = message.slice(1).split(/\s+/);
      const commandName = args.shift().toLowerCase();

      if (commandes.has(commandName)) {
        try {
          commandes.get(commandName).execute(
            { platform: "tiktok", pauseState, username, send: logTikTok },
            args
          );
          logTikTok(`▶️ Commande exécutée : !${commandName} par ${username}`);
        } catch (err) {
          logTikTok(`❌ Erreur exécution commande !${commandName} : ${err.message}`);
        }
      }
    }
  });

  try {
    await tiktok.connect();
  } catch (err) {
    isConnecting = false;
    isConnected = false;
    logTikTok(`⚠️ TikTok hors ligne : ${err.message}`);
    if (tiktokState.shouldRun !== false) {
      setTimeout(connectTikTok, 10_000);
    }
  }
}

// =========================
// EXPORT
// =========================
module.exports = { connectTikTok };

// =========================
// LANCEMENT AUTO
// =========================
connectTikTok();