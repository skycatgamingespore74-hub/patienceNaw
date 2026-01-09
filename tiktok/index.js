require("dotenv").config();
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");
const path = require("path");
const logClock = require("./système/logClock");

const TIKTOK_UNIQUE_ID = process.env.TIKTOK_UNIQUE_ID;
const { client: twitchClient } = require("../twitch/index"); // <-- client Twitch direct

if (!TIKTOK_UNIQUE_ID) {
  console.error("❌ TIKTOK_UNIQUE_ID manquant");
  process.exit(1);
}

const pauseState = { isPaused: false, stoppoints: false };
const commandes = new Map();
const commandesPath = path.join(__dirname, "commandes");
let liveActive = false;

// ----------------------------
// Chargement des commandes
// ----------------------------
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;
    const cmd = require(path.join(commandesPath, file));
    if (cmd?.name && typeof cmd.execute === "function") {
      commandes.set(cmd.name, cmd);
      console.log(`[${logClock.getTime()}] ✅ Commande TikTok chargée : ${cmd.name}`);
    }
  });
}

// ----------------------------
// Fonction pour envoyer un message direct sur Twitch
// ----------------------------
function sendToTwitch(msg) {
  if (!twitchClient) {
    console.warn(`[${logClock.getTime()}] ⚠️ Twitch non connecté, message perdu : ${msg}`);
    return;
  }
  // Envoi sur le channel principal défini dans le client Twitch
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
      send: sendToTwitch // <-- toutes les commandes TikTok enverront sur Twitch
    };

    console.log(`[${logClock.getTime()}] 💬 TikTok | ${ctx.username}: ${ctx.message}`);

    if (ctx.message.startsWith("!")) {
      const args = ctx.message.slice(1).split(/\s+/);
      const name = args.shift().toLowerCase();
      const command = commandes.get(name);
      if (!command) return;

      try {
        command.execute(ctx, args);
        console.log(`[${logClock.getTime()}] ▶️ Commande TikTok exécutée : !${name}`);
      } catch (err) {
        console.error(`[${logClock.getTime()}] ❌ Erreur exécution commande ${name}:`, err);
      }
    }
  });

  tiktok.on("connected", () => {
    liveActive = true;
    console.log(`[${logClock.getTime()}] 🟢 TikTok connecté sur ${TIKTOK_UNIQUE_ID}`);
  });

  tiktok.on("disconnected", () => {
    liveActive = false;
    console.warn(`[${logClock.getTime()}] ⚠️ TikTok déconnecté, nouvelle tentative dans 10s...`);
    setTimeout(connectTikTok, 10_000);
  });

  try {
    console.log(`[${logClock.getTime()}] ⌛ Tentative de connexion TikTok...`);
    await tiktok.connect();
  } catch (err) {
    liveActive = false;
    console.warn(`[${logClock.getTime()}] ⚠️ TikTok non en live, nouvelle tentative dans 10s...`);
    setTimeout(connectTikTok, 10_000);
  }
}

// ----------------------------
// Lancer la connexion
// ----------------------------
connectTikTok();