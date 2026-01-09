const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');
const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'next',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] NEXT refusée : ${username} non autorisé`);
      return;
    }

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ Les commandes sont temporairement indisponibles`);
      console.log(`[${getTime()}] NEXT refusée : bot en pause`);
      return;
    }

    // 📋 Lecture de la file
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
        if (Array.isArray(data)) queue = data;
      } catch {
        console.log(`[${getTime()}] ⚠️ Erreur lecture data.json (NEXT)`);
      }
    }

    // 📭 Liste vide
    if (queue.length === 0) {
      ctx.send(`📭 La liste est vide`);
      console.log(`[${getTime()}] NEXT impossible : liste vide`);
      return;
    }

    // ▶️ Prochain joueur
    const nextPlayer = queue.shift();
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    const pointsActive = !pauseState.stoppoints;
    const mode = pointsActive ? 'payeur' : 'libre';

    ctx.send(`🎮 C'est au tour de ${nextPlayer} (${mode}) !`);
    console.log(`[${getTime()}] NEXT → ${nextPlayer} (${mode})`);
  }
};