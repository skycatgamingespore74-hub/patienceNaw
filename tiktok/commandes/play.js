const pauseState = require('../système/pause');

const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'play',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Vérification permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] PLAY refusée : ${username} non autorisé`);
      return;
    }

    // ⏯ Vérification si commandes déjà actives
    if (!pauseState.isPaused) {
      ctx.send(`▶️ Les commandes sont déjà actives !`);
      console.log(`[${getTime()}] PLAY inutile : commandes déjà actives`);
      return;
    }

    // ✅ Activer les commandes
    pauseState.isPaused = false;
    ctx.send(`▶️ Les interactions et commandes sont maintenant actives !`);
    console.log(`[${getTime()}] PLAY exécutée par ${username}`);
  }
};