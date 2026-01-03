const pauseState = require('../système/pause');

module.exports = {
  name: 'playpoint',
  execute(client, channel, tags) {
    const username = tags.username.toLowerCase();
    const allowed = ['acesky_esport', 'naw_mchh'];
    const isMod = tags.mod;

    if (!allowed.includes(username) && !isMod) {
      client.say(channel, `❌ @${tags['display-name']}, tu n'as pas la permission d'utiliser cette commande.`);
      return;
    }

    if (!pauseState.stoppoints) {
      client.say(channel, `@${tags['display-name']}, le système de points est déjà actif ✅`);
      return;
    }

    pauseState.stoppoints = false;
    client.say(channel, `@${tags['display-name']}, seuls les payeurs peuvent maintenant rejoindre !`);
    console.log(`[${new Date().toLocaleTimeString()}] 🟢 Système de points réactivé par ${tags['display-name']}`);
  }
};