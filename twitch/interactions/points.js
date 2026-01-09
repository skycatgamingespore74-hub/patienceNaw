// points.js
const fs = require('fs');

// =====================
// CONFIG
// =====================
const DATA_PATH = './data/paidUsers.json';
const REWARD_NAME = 'Jouer à Brawl Stars'; // Nom exact qui apparaît dans le chat
const CHANNEL_NAME = process.env.CHANNEL_NAME;

// =====================
// INIT FICHIER
// =====================
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
}

// =====================
// FONCTION AJOUT UTILISATEUR
// =====================
function addUserToQueue(username) {
  let list = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  if (list.includes(username)) {
    console.log(`⚠️ ${username} est déjà dans la file`);
    return false;
  }

  list.push(username);
  fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));

  console.log(`🎮 ${username} ajouté à la file d’attente`);
  return true;
}

// =====================
// EXPORT POUR LE BOT
// =====================
module.exports = (client) => {
  client.on('message', (channel, tags, message, self) => {
    if (self) return;

    // Cherche le message Twitch "XYZ a obtenu Jouer à Brawl Stars (10)"
    const regex = new RegExp(`^(\\w+) a obtenu ${REWARD_NAME}`, 'i');
    const match = message.match(regex);
    if (!match) return;

    const username = match[1];

    if (addUserToQueue(username)) {
      client.say(channel, `@${username} merci pour les points ! 🎮`);
    }
  });

  console.log(`✅ points.js actif. Écoute toutes les rédemptions "${REWARD_NAME}" dans le chat`);
};