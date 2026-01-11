require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");

const tiktokState = require("../shared/tiktokStatus");
const { client: twitchClient } = require("../twitch/index");

const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
const TWITCH_CHANNEL = process.env.CHANNEL_NAME;

if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

// =========================
// ÉTAT & COMMANDES
// =========================
const pauseState = {
  isPaused: false,
  stoppoints: false
};

const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");

// =========================
// HEURE
// =========================
function getTime() {
  return new Date().toLocaleString();
}

// =========================
// CHARGEMENT COMMANDES
// =========================
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const cmd = require(path.join(commandesPath, file));
    if (cmd?.name && typeof cmd.execute === "function") {
      commandes.set(cmd.name, cmd);
      console.log(`[${getTime()}] ✅ Commande TikTok chargée : ${cmd.name}`);
    }
  });
}

// =========================
// ENVOI VERS TWITCH
// =========================
function sendToTwitch(message) {
  if (!twitchClient || typeof twitchClient.say !== "function") {
    console.warn(`[${getTime()}] ⚠️ Twitch indisponible`);
    return;
  }

  twitchClient.say(TWITCH_CHANNEL, `[TikTok] ${message}`);
}

// =========================
// CONNEXION TIKTOK
// =========================
async function connectTikTok() {
  const tiktok = new WebcastPushConnection(TIKTOK_UNIQUE_ID);

  tiktok.on("connected", () => {
    tiktokState.isConnected = true;
    tiktokState.connectedAt = Date.now();

    console.log(`[${getTime()}] 🟢 TikTok connecté`);
  });

  tiktok.on("disconnected", () => {
    tiktokState.isConnected = false;

    console.warn(`[${getTime()}] 🔴 TikTok déconnecté`);
    setTimeout(connectTikTok, 10_000);
  });

  tiktok.on("chat", data => {
    if (!data?.uniqueId || !data?.comment) return;

    // 🔥 Preuve que les messages passent
    tiktokState.lastMessageTimestamp = Date.now();
    tiktokState.lastUser = data.uniqueId;
    tiktokState.lastMessage = data.comment;

    const ctx = {
      platform: "tiktok",
      pauseState,
      username: data.uniqueId,
      message: data.comment.trim(),
      send: sendToTwitch
    };

    console.log(`[${getTime()}] 💬 TikTok | ${ctx.username}: ${ctx.message}`);

    if (!ctx.message.startsWith("!")) return;

    const args = ctx.message.slice(1).trim().split(/\s+/);
    const name = args.shift().toLowerCase();
    const command = commandes.get(name);
    if (!command) return;

    try {
      command.execute(ctx, args);
      console.log(`[${getTime()}] ▶️ Commande TikTok exécutée : !${name}`);
    } catch (err) {
      console.error(`[${getTime()}] ❌ Erreur commande ${name}:`, err);
    }
  });

  try {
    console.log(`[${getTime()}] ⌛ Connexion à TikTok...`);
    await tiktok.connect();
  } catch (err) {
    tiktokState.isConnected = false;
    console.warn(
      `[${getTime()}] ⚠️ TikTok hors ligne, nouvelle tentative dans 10s`
    );
    setTimeout(connectTikTok, 10_000);
  }
}

// =========================
// LANCEMENT
// =========================
connectTikTok();