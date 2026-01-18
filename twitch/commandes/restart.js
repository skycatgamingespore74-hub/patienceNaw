module.exports = {
  name: "restart",
  execute(client, channel, tags) {
    const allowedUsers = ["acesky_esport", "naw_mchh"]; // tes admins
    if (!allowedUsers.includes(tags.username.toLowerCase())) {
      client.say(channel, `@${tags["display-name"]}, vous n'avez pas la permission ❌`);
      return;
    }

    client.say(channel, `@${tags["display-name"]}, redémarrage du bot en cours... 🔄`);

    const { restart } = require("../../système/restart");

    restart(); // Appel direct de notre restart.js
  }
};