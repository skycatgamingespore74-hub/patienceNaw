const pauseState = require('../système/pause');

const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'playpoint',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] PLAYPOINT refusée : ${username} non autorisé`);
      return;
    }

    // ✅ Déjà actif
    if (!pauseState.stoppoints) {
      ctx.send(`@${displayName}, le système de points est déjà actif ✅`);
      console.log(`[${getTime()}] PLAYPOINT inutile : système déjà actif`);
      return;
    }

    // ▶️ Activation points
    pauseState.stoppoints = false;

    ctx.send(`@${displayName}, seuls les payeurs peuvent maintenant rejoindre !`);
    console.log(`[${getTime()}] PLAYPOINT exécutée par ${username}`);
  }
};