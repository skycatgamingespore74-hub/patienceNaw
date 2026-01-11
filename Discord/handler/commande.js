const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const commandesPath = path.join(__dirname, "../commandes");
  const commandesFiles = fs.readdirSync(commandesPath).filter(f => f.endsWith(".js"));

  client.commandes = new Map();

  for (const file of commandesFiles) {
    const cmd = require(path.join(commandesPath, file));
    if (cmd?.data && cmd?.execute) {
      client.commandes.set(cmd.data.name, cmd);
      console.log(`[HANDLER] Commande chargée : ${cmd.data.name}`);
    }
  }
};