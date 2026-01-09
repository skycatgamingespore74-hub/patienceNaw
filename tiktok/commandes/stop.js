const pauseState = require('../système/pause');

const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'stop',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Vérification permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] STOP refusé : ${username} non autorisé`);
      return;
    }

    // ⏸️ Vérification pause déjà active
    if (pauseState.isPaused) {
      ctx.send(`⏸️ Les commandes sont déjà suspendues`);
      console.log(`[${getTime()}] STOP ignoré : bot déjà en pause`);
      return;
    }

    // ✅ Activer pause
    pauseState.isPaused = true;
    ctx.send(`⏸️ Les interactions et commandes sont maintenant suspendues`);
    console.log(`[${getTime()}] STOP exécuté par ${username}`);
  }
};