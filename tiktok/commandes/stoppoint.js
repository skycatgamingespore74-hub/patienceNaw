const pauseState = require('../système/pause');

const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'stoppoint',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Vérification permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] STOPPOINT refusé : ${username} non autorisé`);
      return;
    }

    // ⏸️ Vérification si système déjà désactivé
    if (pauseState.stoppoints) {
      ctx.send(`@${displayName}, le système de points est déjà désactivé ⏸️`);
      console.log(`[${getTime()}] STOPPOINT ignoré : déjà désactivé`);
      return;
    }

    // ✅ Désactiver le système de points
    pauseState.stoppoints = true;
    ctx.send(`@${displayName}, tout le monde peut maintenant rejoindre sans payer !`);
    console.log(`[${getTime()}] STOPPOINT exécuté par ${username}`);
  }
};