require("dotenv").config();

console.log("🚀 Lancement global du bot...");

// Twitch
require("./twitch/index");

// TikTok
require("./tiktok/index");