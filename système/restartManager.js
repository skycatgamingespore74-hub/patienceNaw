const { spawn } = require("child_process");
const path = require("path");

let isRestarting = false;

function restartBot() {
  if (isRestarting) return;
  isRestarting = true;

  console.log("🔄 Restart du bot demandé...");

  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

  // 🟣 CAS RAILWAY
  if (isRailway) {
    console.log("🚄 Environnement Railway détecté");
    console.log("♻️ Arrêt du process — Railway va redémarrer automatiquement");

    process.exit(0); // Railway relance tout seul
  }

  // 🟢 CAS REPLIT / LOCAL
  console.log("🧹 Nettoyage du cache Node...");
  Object.keys(require.cache).forEach(key => delete require.cache[key]);

  const indexPath = path.resolve(__dirname, "../index.js");

  console.log("🛑 Arrêt du process actuel et lancement d'un nouveau process...");

  spawn("node", [indexPath], {
    stdio: "inherit",
    shell: true
  });

  process.exit(0);
}

module.exports = { restartBot };