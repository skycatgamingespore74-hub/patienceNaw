const pauseState = require('../système/pause');

module.exports = {
  name: 'stoppoint',
  execute(client, channel, tags) {
    const username = tags.username.toLowerCase();
    const allowed = ['acesky_esport', 'naw_mchh'];
    const isMod = tags.mod;

    if (!allowed.includes(username) && !isMod) {
      client.say(channel, `❌ @${tags['display-name']}, tu n'as pas la permission d'utiliser cette commande.`);
      return;
    }

    if (pauseState.stoppoints) {
      client.say(channel, `@${tags['display-name']}, le système de points est déjà désactivé ⏸️`);
      return;
    }

    pauseState.stoppoints = true;
    client.say(channel, `@${tags['display-name']}, tout le monde peut maintenant rejoindre sans payer !`);
    console.log(`[${new Date().toLocaleTimeString()}] 🔴 Système de points désactivé par ${tags['display-name']}`);
  }
};