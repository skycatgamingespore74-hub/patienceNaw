const { spawn } = require("child_process");
const path = require("path");

let isRestarting = false;

function restart() {
  if (isRestarting) return;
  isRestarting = true;

  console.log("🔄 Redémarrage demandé...");

  // Nettoyage du cache Node
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
  });

  const indexPath = path.resolve(__dirname, "../index.js");

  console.log("🛑 Lancement du nouveau process Node via shell détaché...");

  // Spawn détaché pour que le nouveau process survive à l'ancien
  const child = spawn("node", [indexPath], {
    shell: true,
    detached: true,
    stdio: "inherit"
  });

  child.unref(); // permet au child de continuer si le parent meurt

  // Terminer l'ancien process après un petit délai
  setTimeout(() => {
    console.log("✅ Nouveau process lancé, ancien process terminé.");
    process.exit(0);
  }, 1000);
}

module.exports = { restart };