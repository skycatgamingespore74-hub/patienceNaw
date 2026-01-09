const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

// Liste des utilisateurs autorisés spécifiquement
const allowedUsers = ['acesky_esport', 'naw_mchh'];

module.exports = {
  name: 'next',
  execute(client, channel, tags) {
    const user = tags.username.toLowerCase();

    // Vérifier si l'utilisateur est un mod, le streamer ou autorisé explicitement
    const isMod = tags.mod;
    const isBroadcaster = tags.badges && tags.badges.broadcaster;
    if (!(isMod || isBroadcaster || allowedUsers.includes(user))) {
      client.say(channel, `❌ @${tags['display-name']}, tu n'as pas la permission d'utiliser cette commande.`);
      return;
    }

    if (pauseState.isPaused) {
      client.say(channel, `⏸️ Les commandes sont temporairement indisponibles.`);
      return;
    }

    // Lire le fichier queue
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE));
        if (Array.isArray(data)) queue = data;
        else console.log('⚠️ Le fichier queue n’est pas un tableau, réinitialisation.');
      } catch (err) {
        console.log('⚠️ Erreur en lisant data.json, réinitialisation :', err);
      }
    }

    if (queue.length === 0) {
      client.say(channel, `La liste est vide pour le moment.`);
      return;
    }

    // Prendre le premier joueur
    const nextPlayer = queue.shift();

    // Réécrire le fichier
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    const pointsActive = !pauseState.stoppoints;
    client.say(
      channel,
      `🎮 C'est au tour de ${nextPlayer} ${pointsActive ? '(payeur)' : '(libre)'} !`
    );

    console.log(`[${new Date().toLocaleTimeString()}] ⏭️ Prochain joueur: ${nextPlayer}`);
  }
};