const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, '../../data/data.json');
const allowedUsers = ['skycatgamingesport', 'naw_mchh'];

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

module.exports = {
  name: 'reset-list',

  execute(ctx) {
    if (!ctx || !ctx.username || typeof ctx.send !== 'function') return;

    const username = ctx.username.toLowerCase();
    const displayName = ctx.username;

    // 🔐 Permission
    if (!allowedUsers.includes(username)) {
      ctx.send(`❌ @${displayName}, tu n'as pas la permission`);
      console.log(`[${getTime()}] RESET-LIST refusée : ${username} non autorisé`);
      return;
    }

    // ♻️ Reset de la file
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));

    ctx.send(`@${displayName}, la file d'attente a été réinitialisée ✅`);
    console.log(`[${getTime()}] RESET-LIST exécutée par ${username}`);
  }
};