require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");

const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
const { client: twitchClient } = require("../twitch/index"); // Assure-toi que Twitch exporte { client }

if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

// ----------------------------
// État du bot
// ----------------------------
const pauseState = { isPaused: false, stoppoints: false };
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");
let liveActive = false;

// ----------------------------
// Fonction pour l'heure
// ----------------------------
function getTime() {
  return new Date().toLocaleString(); // format local, ex: "Jan 9, 2026 23:12:31"
}

// ----------------------------
// Chargement des commandes
// ----------------------------
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

// ----------------------------
// Relai vers Twitch
// ----------------------------
function sendToTwitch(msg) {
  if (!twitchClient) {
    console.warn(`[${getTime()}] ⚠️ Twitch non connecté, message perdu : ${msg}`);
    return;
  }
  twitchClient.say(process.env.CHANNEL_NAME, `[TikTok] ${msg}`);
}

// ----------------------------
// Connexion TikTok
// ----------------------------
async function connectTikTok() {
  const tiktok = new WebcastPushConnection(TIKTOK_UNIQUE_ID);

  tiktok.on("chat", data => {
    if (!liveActive || !data || !data.uniqueId || !data.comment) return;

    const ctx = {
      platform: "tiktok",
      pauseState,
      username: data.uniqueId,
      message: data.comment.trim(),
      send: sendToTwitch
    };

    console.log(`[${getTime()}] 💬 TikTok | ${ctx.username}: ${ctx.message}`);

    if (ctx.message.startsWith("!")) {
      const args = ctx.message.slice(1).split(/\s+/);
      const name = args.shift().toLowerCase();
      const command = commandes.get(name);
      if (!command) return;

      try {
        command.execute(ctx, args);
        console.log(`[${getTime()}] ▶️ Commande TikTok exécutée : !${name}`);
      } catch (err) {
        console.error(`[${getTime()}] ❌ Erreur exécution commande ${name}:`, err);
      }
    }
  });

  tiktok.on("connected", () => {
    liveActive = true;
    console.log(`[${getTime()}] 🟢 TikTok connecté sur ${TIKTOK_UNIQUE_ID}`);
  });

  tiktok.on("disconnected", () => {
    liveActive = false;
    console.warn(`[${getTime()}] ⚠️ TikTok déconnecté, nouvelle tentative dans 10s...`);
    setTimeout(connectTikTok, 10_000);
  });

  try {
    console.log(`[${getTime()}] ⌛ Tentative de connexion TikTok...`);
    await tiktok.connect();
  } catch (err) {
    liveActive = false;
    console.warn(`[${getTime()}] ⚠️ TikTok non en live, nouvelle tentative dans 10s...`);
    setTimeout(connectTikTok, 10_000);
  }
}

// ----------------------------
// Lancement
// ----------------------------
connectTikTok();