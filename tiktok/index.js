require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");

const tiktokState = require("../shared/tiktokStatus");

// =========================
// ENV
// =========================
const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ [TikTok] TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

// =========================
// PROTECTION ANTI-DOUBLON
// =========================
if (global.__TIKTOK_STARTED__) return;
global.__TIKTOK_STARTED__ = true;

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
// HORODATAGE PRÉCIS
// =========================
function now() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, "0");
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}

// =========================
// LOG TIKTOK (NODE ONLY)
// =========================
function logTikTok(message) {
  console.log(`${now()} 💬[TikTok] ${message}`);
}

// =========================
// CHARGEMENT COMMANDES
// =========================
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;
    try {
      const cmd = require(path.join(commandesPath, file));
      if (cmd?.name && typeof cmd.execute === "function") {
        commandes.set(cmd.name.toLowerCase(), cmd);
        logTikTok(`✅ Commande chargée : ${cmd.name}`);
      }
    } catch (err) {
      console.error(`${now()} [TikTok] ❌ Erreur commande ${file}`, err);
    }
  });
}

// =========================
// CONNEXION TIKTOK
// =========================
async function connectTikTok() {
  if (isConnecting || isConnected) {
    logTikTok("⚠️ Connexion déjà active");
    return;
  }

  if (!tiktokState.shouldRun) {
    logTikTok("ℹ️ TikTok ne doit pas tourner actuellement");
    return;
  }

  isConnecting = true;

  // 🔹 Log unique de connexion
  logTikTok("⌛ Connexion TikTok...");

  tiktok = new WebcastPushConnection(TIKTOK_UNIQUE_ID);

  // ------------------------
  // Événement connecté
  // ------------------------
  tiktok.on("connected", () => {
    isConnected = true;
    isConnecting = false;
    tiktokState.isConnected = true;
    logTikTok("🟢 TikTok connecté");
  });

  // ------------------------
  // Événement déconnecté
  // ------------------------
  tiktok.on("disconnected", () => {
    isConnected = false;
    isConnecting = false;
    tiktokState.isConnected = false;
    logTikTok("🔴 TikTok déconnecté");

    if (tiktokState.shouldRun !== false) {
      setTimeout(connectTikTok, 10_000);
    }
  });

  // ------------------------
  // Événement message
  // ------------------------
  tiktok.on("chat", data => {
    if (!data?.uniqueId || !data?.comment) return;

    const username = data.uniqueId;
    const message = data.comment.trim();
    tiktokState.lastMessageTimestamp = Date.now();

    logTikTok(`${username}: ${message}`);

    if (!message.startsWith("!")) return;

    const args = message.slice(1).split(/\s+/);
    const name = args.shift().toLowerCase();
    const command = commandes.get(name);
    if (!command) return;

    try {
      command.execute({ platform: "tiktok", pauseState, username, send: logTikTok }, args);
      logTikTok(`▶️ Commande exécutée : !${name} par ${username}`);
    } catch (err) {
      console.error(`${now()} [TikTok] ❌ Erreur commande !${name}`, err);
    }
  });

  // ------------------------
  // Connexion initiale
  // ------------------------
  try {
    await tiktok.connect();
  } catch (err) {
    isConnecting = false;
    isConnected = false;
    console.error(`${now()} [TikTok] ⚠️ TikTok hors ligne ou Erreur de connexion `);
    if (tiktokState.shouldRun) {
      setTimeout(connectTikTok, 10_000);
    }
  }
}

// =========================
// EXPORT
// =========================
module.exports = { connectTikTok };

// =========================
// AUTO START
// =========================
connectTikTok();