// index.js (général)
require("dotenv").config();
const path = require("path");

// =========================
// IMPORT MODULES
// =========================
const DiscordModule = require("./Discord/index"); // Discord déjà géré là-dedans
const TwitchModule = require("./twitch/index");    // Twitch gère sa connexion
const TikTokModule = require("./tiktok/index");    // TikTok gère sa connexion

// =========================
// LANCEMENT DES BOTS
// =========================

// Twitch : vérifie si déjà lancé
if (!global.__TWITCH_STARTED__) {
  require("./twitch/index"); // se connecte automatiquement
}

// TikTok : auto-launch déjà dans index
TikTokModule.connectTikTok();

// Discord : déjà géré dans Discord/index.js
console.log("🤖 Index général chargé : Discord/Twitch/TikTok initiaux");

// =========================
// ATTENTION :
// - Pas de client.login Discord ici
// - Pas de client.once('ready') Discord ici
// - Pas de doublons Twitch/TikTok