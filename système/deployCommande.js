// Discord/système/deployCommande.js
const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
require("dotenv").config();

// ----------------------------
// Variables d'environnement
// ----------------------------
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ----------------------------
// Chemin vers les commandes
// ----------------------------
const commandesPath = path.join(__dirname, "../Discord/commandes");
const commandes = [];

// ----------------------------
// Lecture des fichiers commandes
// ----------------------------
if (fs.existsSync(commandesPath)) {
  fs.readdirSync(commandesPath).forEach(file => {
    if (!file.endsWith(".js")) return;
    const cmd = require(path.join(commandesPath, file));
    if (cmd?.data) {
      commandes.push(cmd.data.toJSON());
    }
  });
} else {
  console.warn("⚠️ Dossier 'commandes' introuvable, aucune commande à déployer");
}

// ----------------------------
// Déploiement des commandes
// ----------------------------
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(`⌛ Déploiement de ${commandes.length} commande(s) sur le serveur...`);

    if (commandes.length === 0) {
      console.log("⚠️ Aucune commande à déployer.");
      return;
    }

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commandes }
    );

    console.log("✅ Commandes déployées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du déploiement :", error);
  }
})();