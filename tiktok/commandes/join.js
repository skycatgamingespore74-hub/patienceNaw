const fs = require('fs');
const path = require('path');
const pauseState = require('../système/pause');

const PAID_FILE = path.join(__dirname, '../../data/paidUsers.json');
const QUEUE_FILE = path.join(__dirname, '../../data/data.json');

module.exports = {
  name: 'join',

  execute(ctx, args) {
    // Vérifie que ctx et la fonction send (Twitch) sont présents
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const user = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ JOIN ignoré : bot en pause`);
      return;
    }

    // 🔐 Vérification points payeurs
    const pointsActive = !pauseState.stoppoints;
    if (pointsActive) {
      let paidUsers = [];
      if (fs.existsSync(PAID_FILE)) {
        try {
          const data = JSON.parse(fs.readFileSync(PAID_FILE, 'utf8'));
          if (Array.isArray(data)) paidUsers = data;
        } catch {
          ctx.send(`[TikTok] ⚠️ Erreur lecture paidUsers.json`);
        }
      }

      if (paidUsers.length > 0 && !paidUsers.includes(user)) {
        ctx.send(` ❌ ${displayName} ne peut pas rejoindre (pas payeur)`);
        return;
      }
    }

    // 📋 Lecture de la file d'attente
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
        if (Array.isArray(data)) queue = data;
      } catch {
        ctx.send(`[TikTok] ⚠️ Erreur lecture data.json`);
      }
    }

    // 🔍 Vérifier si déjà présent
    if (queue.includes(displayName)) {
      ctx.send(`ℹ️ ${displayName} est déjà dans la liste`);
      return;
    }

    // ✅ Ajout à la file
    queue.push(displayName);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    ctx.send(` ✅ ${displayName} a rejoint la liste ! Position : ${queue.length} ${pointsActive ? 'payeur' : 'libre'}`);
  }
};