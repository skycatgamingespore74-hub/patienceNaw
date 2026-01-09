const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'list',

  execute(ctx) {
    if (!ctx || typeof ctx.send !== 'function') return;

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ Commandes indisponibles`);
      console.log(`[${getTime()}] LIST refusée : pause active`);
      return;
    }

    // 📋 Lecture de la file
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
        if (Array.isArray(data)) queue = data;
      } catch {
        console.log(`[${getTime()}] ⚠️ Erreur lecture data.json (LIST)`);
      }
    }

    // 📭 Liste vide
    if (queue.length === 0) {
      ctx.send(`📭 La liste est vide`);
      console.log(`[${getTime()}] LIST : liste vide`);
      return;
    }

    // 🎟️ Mode
    const pointsActive = !pauseState.stoppoints;
    const mode = pointsActive ? 'payeur' : 'libre';

    // ✅ Envoi
    ctx.send(`📋 Liste des joueurs (${mode}) : ${queue.join(', ')}`);
    console.log(`[${getTime()}] LIST OK : ${queue.length} joueur(s) (${mode})`);
  }
};