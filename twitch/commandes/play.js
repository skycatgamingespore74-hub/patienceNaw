const pauseState = require('../système/pause');

module.exports = {
  name: 'play',
  execute(client, channel, tags) {
    const username = tags.username.toLowerCase();
    const allowed = ['acesky_esport', 'naw_mchh'];
    const isMod = tags.mod;

    if (!allowed.includes(username) && !isMod) {
      client.say(channel, `❌ @${tags['display-name']}, tu n'as pas la permission d'utiliser cette commande.`);
      return;
    }

    if (!pauseState.isPaused) {
      client.say(channel, `▶️ Les commandes sont déjà actives !`);
      return;
    }

    pauseState.isPaused = false;
    client.say(channel, `▶️ Les interactions et commandes sont maintenant actives !`);
    console.log(`[${new Date().toLocaleTimeString()}] Bot relancé par ${tags['display-name']}`);
  }
};