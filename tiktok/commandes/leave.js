const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'leaveadmin',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const displayName = ctx.username;

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ Commandes indisponibles`);
      console.log(`[${getTime()}] LEAVE refusé (pause) : ${displayName}`);
      return;
    }

    // 📋 Lecture de la file
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
        if (Array.isArray(data)) queue = data;
      } catch {
        console.log(`[${getTime()}] ⚠️ Erreur lecture data.json (LEAVE)`);
      }
    }

    // ❌ Pas dans la liste
    const index = queue.findIndex(
      u => u.toLowerCase() === displayName.toLowerCase()
    );

    if (index === -1) {
      ctx.send(`❌ ${displayName}, tu n'es pas dans la liste`);
      console.log(`[${getTime()}] LEAVE refusé : ${displayName} absent`);
      return;
    }

    // ✅ Suppression
    queue.splice(index, 1);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    ctx.send(`❌ ${displayName} a quitté la liste`);
    console.log(`[${getTime()}] LEAVE OK : ${displayName}`);
  }
};