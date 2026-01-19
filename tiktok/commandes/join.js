// fichier : tiktok/commandes/join.js
const fs = require("fs");
const path = require("path");
const pauseState = require("../système/pause");

const QUEUE_FILE = path.join(__dirname, "../../data/data.json");

module.exports = {
  name: "join",

  execute(ctx, args) {
    // Sécurité minimale
    if (!ctx || !ctx.username || typeof ctx.send !== "function") return;

    const displayName = ctx.username;

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ JOIN ignoré : bot en pause`);
      return;
    }

    // 📋 Lecture de la file d'attente
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
        if (Array.isArray(data)) queue = data;
      } catch (err) {
        console.error("[TikTok JOIN] Erreur lecture data.json :", err);
        ctx.send(`⚠️ Erreur interne (file d'attente)`);
        return;
      }
    }

    // 🔍 Vérifie si déjà présent
    if (queue.includes(displayName)) {
      ctx.send(`ℹ️ ${displayName} est déjà dans la liste`);
      return;
    }

    // ✅ Ajout à la file
    queue.push(displayName);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

    ctx.send(
      `✅ ${displayName} a rejoint la liste ! Position : ${queue.length}`
    );

    console.log(`➕ [TikTok] ${displayName} ajouté à la file`);
  }
};