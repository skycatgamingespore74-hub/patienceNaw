const fs = require("fs");
const path = require("path");

// Chemin vers le fichier data-like.json
const DATA_LIKE_FILE = path.join(__dirname, "../../data/data-like.json");

module.exports = {
  name: "reset-like",

  execute(ctx) {
    console.log("⚠️ Commande reset-like exécutée");

    try {
      // Vérifier si le fichier existe
      const fileExists = fs.existsSync(DATA_LIKE_FILE);
      console.log(`🔹 Fichier exists : ${fileExists}`);

      // Si fichier existe, afficher sa taille avant reset
      if (fileExists) {
        const stats = fs.statSync(DATA_LIKE_FILE);
        console.log(`🔹 Taille fichier avant reset : ${stats.size} octets`);
      }

      // Réinitialiser le fichier avec un objet vide
      fs.writeFileSync(DATA_LIKE_FILE, JSON.stringify({}, null, 2), "utf8");
      console.log("✅ Fichier data-like.json réinitialisé sur le disque");

      // Vider le compteur en mémoire
      if (ctx?.likeCounter) {
        const keys = Object.keys(ctx.likeCounter);
        keys.forEach(key => delete ctx.likeCounter[key]);
        console.log(`✅ Compteur en mémoire vidé (${keys.length} entrées supprimées)`);
      } else {
        console.log("ℹ️ Aucun compteur en mémoire trouvé");
      }

      // Message de confirmation
      const message = "✅ Le fichier de likes a été réinitialisé avec succès !";
      console.log(message);

      // Envoyer message dans le chat si ctx.send existe
      if (ctx?.send) {
        ctx.send(message);
        console.log("🔹 Message envoyé dans Twitch");
      }

      // Vérification après reset
      const dataAfter = fs.readFileSync(DATA_LIKE_FILE, "utf8");
      console.log(`🔹 Contenu du fichier après reset : ${dataAfter}`);

    } catch (err) {
      const errorMsg = `❌ Impossible de réinitialiser le fichier de likes : ${err.message}`;
      console.error(errorMsg);
      if (ctx?.send) ctx.send(errorMsg);
    }
  }
};