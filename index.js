require("dotenv").config();

console.log("🚀 Lancement global du bot...");

// Discord
require("./Discord/index");

// Twitch
require("./twitch/index");

// Tiktok
require("./tiktok/index");