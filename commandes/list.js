const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../data/data.json');

module.exports = {
  name: 'list',
  execute(client, channel, tags) {
    if (pauseState.isPaused) {
      client.say(channel, `⏸️ Les commandes sont temporairement indisponibles.`);
      return;
    }

    // Lire le fichier queue en s'assurant que c'est bien un tableau
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE));
        if (Array.isArray(data)) {
          queue = data;
        } else {
          console.log('⚠️ Le fichier queue n’est pas un tableau, réinitialisation.');
        }
      } catch (err) {
        console.log('⚠️ Erreur en lisant queue.json, réinitialisation :', err);
      }
    }

    if (queue.length === 0) {
      client.say(channel, `La liste est vide pour le moment.`);
      return;
    }

    const pointsActive = !pauseState.stoppoints;
    client.say(
      channel,
      `Liste des joueurs (${pointsActive ? 'payeur' : 'libre'}): ${queue.join(', ')}`
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] 📋 Liste affichée (${queue.length} joueurs)`
    );
  }
};