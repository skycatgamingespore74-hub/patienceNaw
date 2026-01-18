let restarting = false;

function restartBot() {
  if (restarting) return;
  restarting = true;

  console.log("🔄 Redémarrage HARD du bot demandé...");

  // Petit délai pour laisser Twitch envoyer le message
  setTimeout(() => {
    console.log("🛑 Arrêt du process Node...");
    process.exit(0); // ⚠️ CECI déclenche le redémarrage auto
  }, 1500);
}

module.exports = { restartBot };