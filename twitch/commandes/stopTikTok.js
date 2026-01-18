const tiktokState = require("../../shared/tiktokStatus");

module.exports = {
  name: "stoptiktok",
  execute(client, channel, tags) {
    const allowedUsers = ["acesky_esport", "naw_mchh"];
    if (!allowedUsers.includes(tags.username.toLowerCase()) && !tags.mod) return;

    if (!tiktokState.shouldRun) {
      client.say(channel, `⚠️ TikTok est déjà arrêté`);
      return;
    }

    tiktokState.shouldRun = false;
    client.say(channel, `🛑 TikTok arrêté`);
    console.log("TikTok stoppé via commande Twitch");
  }
};