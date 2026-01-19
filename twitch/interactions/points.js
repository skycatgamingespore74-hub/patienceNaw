// interaction/points.js
const fs = require('fs');
const path = require('path');

// =====================
// CONFIG
// =====================
const DATA_PATH = path.join(__dirname, '../data/paidUsers.json');
const REWARD_NAME = 'Jouer à Brawl Stars';

// =====================
// INIT FICHIER
// =====================
const dataDir = path.dirname(DATA_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
}

// =====================
// AJOUT UTILISATEUR
// =====================
function addUserToQueue(username) {
  const list = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  if (list.includes(username)) {
    console.log(`⚠️ [Points] ${username} déjà dans la file`);
    return false;
  }

  list.push(username);
  fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));

  console.log(`🎮 [Points] ${username} ajouté à la file`);
  return true;
}

// =====================
// INTERACTION
// =====================
module.exports = {
  execute({ client, channel, message }) {
    if (!client || !message) return;

    // Exemple attendu :
    // "Noahm a obtenu Jouer à Brawl Stars (10)"
    const regex = new RegExp(`^(\\w+) a obtenu ${REWARD_NAME}`, 'i');
    const match = message.match(regex);
    if (!match) return;

    const username = match[1];

    if (addUserToQueue(username)) {
      client.say(channel, `@${username} merci pour les points ! 🎮`);
    }
  }
};