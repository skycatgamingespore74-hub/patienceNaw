const { spawn } = require("child_process");
const path = require("path");

let isRestarting = false;

/**
 * Redémarre le bot global (index.js)
 */
function restartBot() {
  if (isRestarting) return; // Empêche double restart
  isRestarting = true;

  console.log("🔄 Restart du bot demandé...");

  // Nettoyage du cache Node avant relance
  Object.keys(require.cache).forEach(key => delete require.cache[key]);

  const indexPath = path.resolve(__dirname, "../index.js");

  console.log("🛑 Arrêt du process actuel et lancement d'un nouveau process...");

  // Lance le nouveau process Node
  spawn("node", [indexPath], { stdio: "inherit", shell: true });

  // Termine le process actuel
  process.exit(0);
}

module.exports = { restartBot };