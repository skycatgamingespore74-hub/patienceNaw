const tiktokState = require("../../shared/tiktokStatus");
const { connectTikTok } = require("../../tiktok/index"); // l’index TikTok doit exporter cette fonction

module.exports = {
  name: "playtiktok",
  execute(client, channel, tags) {
    const allowedUsers = ["acesky_esport", "naw_mchh"];
    if (!allowedUsers.includes(tags.username.toLowerCase()) && !tags.mod) return;

    if (tiktokState.shouldRun) {
      client.say(channel, `⚠️ TikTok est déjà en fonctionnement`);
      return;
    }

    tiktokState.shouldRun = true;
    connectTikTok(); // relance la connexion TikTok
    client.say(channel, `▶️ TikTok redémarré`);
    console.log("TikTok redémarré via commande Twitch");
  }
};