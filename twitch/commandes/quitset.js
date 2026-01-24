const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/data.json');

// Charger la file d'attente
function loadQueue() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error("⚠️ Impossible de lire data.json, fichier recréé.", err);
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

// Sauvegarder la file
function saveQueue(queue) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(queue, null, 2), 'utf8');
}

module.exports = {
  name: 'quitset',
  execute(client, channel, tags, args) {
    const username = tags.username.toLowerCase();
    const allowed = ['acesky_esport', 'naw_mchh'];
    const isMod = tags.mod;

    if (!allowed.includes(username) && !isMod) {
      client.say(channel, `❌ @${tags['display-name']}, vous n'avez pas la permission.`);
      return;
    }

    const target = args[0]?.toLowerCase();
    if (!target) {
      client.say(channel, `⚠️ Usage: !quitset <nom>`);
      return;
    }

    let queue = loadQueue();

    if (!queue.includes(target)) {
      client.say(channel, `⚠️ ${target} n'est pas dans la file d'attente.`);
      return;
    }

    queue = queue.filter(u => u !== target);
    saveQueue(queue);

    client.say(channel, `✅ ${target} a été retiré de la file d'attente.`);
    console.log(`[${new Date().toLocaleTimeString()}] 🔄 ${target} retiré de la file d'attente par ${tags['display-name']}`);
  }
};