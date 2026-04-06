require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");

const tiktokState = require("../shared/tiktokStatus");

// =========================
// ENV
// =========================
const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
const TWITCH_CHANNEL = process.env.CHANNEL_NAME;

if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ [TikTok] TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

// =========================
// PROTECTION ANTI-DOUBLON
// =========================
if (global.__TIKTOK_STARTED__) return;
global.__TIKTOK_STARTED__ = true;

// =========================
// ÉTAT
// =========================
let isConnecting = false;
let isConnected = false;
let tiktok = null;

// =========================
// COMMANDES
// =========================
const pauseState = { isPaused: false, stoppoints: false };
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");

// =========================
// LIKES – CHEMIN
// =========================
const DATA_DIR = path.join(__dirname, "../data");
const DATA_LIKE_FILE = path.join(DATA_DIR, "data-like.json");

// =========================
// SÉCURITÉ FICHIER
// =========================
function ensureLikeFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_LIKE_FILE)) {
    fs.writeFileSync(DATA_LIKE_FILE, JSON.stringify({}, null, 2), "utf8");
    console.log("🆕 data-like.json créé");
  }
}

function loadLikes() {
  ensureLikeFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_LIKE_FILE, "utf8"));
  } catch {
    fs.writeFileSync(DATA_LIKE_FILE, JSON.stringify({}, null, 2), "utf8");
    return {};
  }
}

function saveLikes(data) {
  ensureLikeFile();
  fs.writeFileSync(DATA_LIKE_FILE, JSON.stringify(data, null, 2), "utf8");
}

// =========================
// HORODATAGE
// =========================
function now() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, "0");
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}

function logTikTok(msg) {
  console.log(`${now()} 💬[TikTok] ${msg}`);
}

// =========================
// ENVOI TWITCH
// =========================
function sendToTwitch(message) {
  try {
    const { client } = require("../twitch/index");
    if (!client) return;
    client.say(TWITCH_CHANNEL, `[TikTok] ${message}`);
  } catch {
    console.warn(`${now()} ⚠️ Twitch non prêt`);
  }
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
      console.error(`${now()} ❌ Erreur commande ${file}`, err);
    }
  });
}

// =========================
// CONNEXION TIKTOK (ancien index avec toutes les logs)
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
  // Événement chat
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
      command.execute({ platform: "tiktok", pauseState, username, send: sendToTwitch }, args);
      logTikTok(`▶️ Commande exécutée : !${name} par ${username}`);
    } catch (err) {
      console.error(`${now()} [TikTok] ❌ Erreur commande !${name}`, err);
    }
  });

  // ------------------------
  // Événement like
  // ------------------------
  tiktok.on("like", data => {
    if (!data?.uniqueId || !data?.likeCount) return;

    const username = data.uniqueId;
    const likes = Number(data.likeCount) || 0;
    const likeCounter = loadLikes();

    if (!likeCounter[username]) likeCounter[username] = 0;
    likeCounter[username] += likes;

    saveLikes(likeCounter);
    //logTikTok(`❤️ ${username} a envoyé ${likes} like(s) (total: ${likeCounter[username]})`);
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
// START
// =========================
connectTikTok();

module.exports = { connectTikTok };