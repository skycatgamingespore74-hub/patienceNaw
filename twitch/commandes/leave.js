const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

module.exports = {
  name: 'leave',
  execute(client, channel, tags) {
    const user = tags['display-name'];

    if (pauseState.isPaused) {
      client.say(channel, `⏸️ Les commandes sont temporairement indisponibles.`);
      return;
    }

    // Lire la queue depuis le fichier
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE));
        if (Array.isArray(data)) {
          queue = data;
        } else {
          console.log('⚠️ Le fichier data.json n’est pas un tableau, réinitialisation.');
          queue = [];
        }
      } catch (err) {
        console.log('⚠️ Erreur en lisant data.json, réinitialisation :', err);
        queue = [];
      }
    }

    // Vérifier si l'utilisateur est dans la liste
    const index = queue.findIndex(u => u.toLowerCase() === user.toLowerCase());
    if (index === -1) {
      client.say(channel, `@${user}, tu n'es pas dans la liste.`);
      return;
    }

    // Retirer l'utilisateur
    queue.splice(index, 1);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    client.say(channel, `@${user} a quitté la liste.`);
    console.log(`[${new Date().toLocaleTimeString()}] ❌ ${user} a quitté la liste`);
  }
};