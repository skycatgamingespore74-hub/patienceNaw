// fichier : tiktok/commandes/join.js
const fs = require("fs");
const path = require("path");
const pauseState = require("../système/pause");
const pointsTikTok = require("../système/points");

const QUEUE_FILE = path.join(__dirname, "../../data/data.json");

module.exports = {
  name: "joinadmin",

  execute(ctx, args) {
    // Sécurité minimale
    if (!ctx || !ctx.username || typeof ctx.send !== "function") return;

    const user = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // ⏸️ Pause globale
    if (pauseState.isPaused) {
      ctx.send(`⏸️ JOIN ignoré : bot en pause`);
      return;
    }

    // 🔍 Récupération des points TikTok (avec fallback)
    let userPoints = {
      isFan: false,
      likes: 0,
      gifts: 0
    };

    if (typeof pointsTikTok.getUserPoints === "function") {
      const data = pointsTikTok.getUserPoints(user);
      if (data) userPoints = data;
    }

    const hasAccess =
      userPoints.isFan === true ||
      userPoints.likes >= 500 ||
      userPoints.gifts >= 1;

    if (!hasAccess) {
      ctx.send(
        `❌ ${displayName} ne peut pas rejoindre : conditions non remplies (fan, 500 likes ou 1 cadeau)`
      );
      return;
    }

    // 📋 Lecture de la file d'attente
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
        if (Array.isArray(data)) queue = data;
      } catch (err) {
        console.error("[JOIN] Erreur lecture data.json :", err);
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
  }
};