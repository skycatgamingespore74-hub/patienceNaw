const fs = require('fs');
const path = require('path');

// Chemin vers la file d'attente
const QUEUE_FILE = path.join(__dirname, '../data/data.json');

module.exports = {
  name: 'reset-list',
  execute(client, channel, tags) {
    const username = tags.username.toLowerCase();
    const allowed = ['acesky_esport', 'naw_mchh'];
    const isMod = tags.mod;

    if (!allowed.includes(username) && !isMod) {
      client.say(channel, `❌ @${tags['display-name']}, tu n'as pas la permission de réinitialiser la liste.`);
      return;
    }

    // Réinitialise la liste
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));

    client.say(channel, `@${tags['display-name']}, la file d'attente a été réinitialisée ✅`);
    console.log(`[${new Date().toLocaleTimeString()}] 🔄 File d'attente réinitialisée par ${tags['display-name']}`);
  }
};