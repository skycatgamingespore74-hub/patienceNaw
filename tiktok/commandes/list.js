const fs = require("fs");
const path = require("path");
const pauseState = require("../système/pause");

const QUEUE_FILE = path.join(__dirname, "../../data/data.json");

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour12: false });
}

module.exports = {
  name: "list",

  execute(ctx) {
    if (!ctx || typeof ctx.send !== "function") return;

    if (pauseState.isPaused) {
      ctx.send("⏸️ Commandes indisponibles");
      return;
    }

    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
        if (Array.isArray(data)) queue = data;
      } catch {
        ctx.send("⚠️ Erreur de lecture de la liste");
        return;
      }
    }

    if (queue.length === 0) {
      ctx.send("📭 La liste est vide");
      return;
    }

    const mode = pauseState.stoppoints ? "libre" : "payeur";
    ctx.send(`📋 Liste des joueurs (${mode}) : ${queue.join(", ")}`);
  }
};