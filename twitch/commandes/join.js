const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

// Chemins absolus vers les fichiers dans data
const PAID_FILE = path.join(__dirname, '../../data/paidUsers.json');
const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

module.exports = {
  name: 'join',
  execute(client, channel, tags) {
    if (pauseState.isPaused) {
      client.say(channel, `⏸️ Les commandes sont temporairement indisponibles.`);
      return;
    }

    const user = tags['display-name'];
    const userLogin = tags.username.toLowerCase();

    // Mode payeur ou libre
    const pointsActive = !pauseState.stoppoints;

    // Vérification des payeurs si le système est actif
    if (pointsActive) {
      let paidUsers = [];
      if (fs.existsSync(PAID_FILE)) {
        try {
          const data = JSON.parse(fs.readFileSync(PAID_FILE));
          if (Array.isArray(data)) paidUsers = data;
          else console.log('⚠️ paidUsers.json n’est pas un tableau, réinitialisation.');
        } catch (err) {
          console.log('⚠️ Erreur en lisant paidUsers.json:', err);
        }
      }

      if (paidUsers.length === 0) {
        client.say(channel, `@${user}, aucun paiement détecté pour le moment.`);
        return;
      }

      if (!paidUsers.includes(userLogin)) {
        client.say(channel, `@${user}, tu dois utiliser les points de chaîne pour pouvoir jouer 🎮`);
        return;
      }
    }

    // Gestion de la file d'attente
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE));
        if (Array.isArray(data)) queue = data;
        else console.log('⚠️ data.json n’est pas un tableau, réinitialisation.');
      } catch (err) {
        console.log('⚠️ Erreur en lisant data.json:', err);
      }
    }

    if (queue.includes(user)) {
      client.say(channel, `@${user}, tu es déjà dans la liste.`);
      return;
    }

    queue.push(user);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    client.say(
      channel,
      `@${user} a rejoint la liste ! Position : ${queue.length} ${pointsActive ? '(payeur)' : '(libre)'}`
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ ${user} a rejoint la liste ${pointsActive ? '(payeur)' : '(libre)'}`
    );
  }
};