require('dotenv').config();
const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');

// =========================
// VARIABLES ENV
// =========================
const BOT_USERNAME = process.env.BOT_USERNAME;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_NAME = process.env.CHANNEL_NAME;

// =========================
// PAUSE SYSTEM (OBJET PARTAGÉ)
// =========================
const pauseState = {
  isPaused: false
};

// =========================
// COMMANDES ET INTERACTIONS
// =========================
const commandes = new Map();
const interactions = [];

// Charger les commandes
const commandesPath = path.join(__dirname, 'commandes');
fs.readdirSync(commandesPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(path.join(commandesPath, file));
    commandes.set(command.name, command);
    console.log(`Commande chargée !${command.name}`);
  }
});

// Charger les interactions
const interactionsPath = path.join(__dirname, 'interactions');
fs.readdirSync(interactionsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const interaction = require(path.join(interactionsPath, file));
    interactions.push(interaction);
    console.log(`Interaction chargée ${file}`);
  }
});

// =========================
// CLIENT TMI
// =========================
const client = new tmi.Client({
  options: { debug: true },
  connection: { reconnect: true, secure: true },
  identity: {
    username: BOT_USERNAME,
    password: BOT_TOKEN
  },
  channels: [CHANNEL_NAME]
});

// =========================
// CONNEXION SAFE (ANTI-CRASH)
// =========================
(async () => {
  console.log('Démarrage du bot Twitch...');
  try {
    await client.connect();
    console.log(`Bot connecté à Twitch sur ${CHANNEL_NAME}`);
  } catch (err) {
    console.error('Connexion Twitch échouée :', err.message);
    console.log('Le bot continue de tourner malgré l’erreur.');
  }
})();

// =========================
// GESTION DES COMMANDES
// =========================
client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  if (!message.startsWith('!')) return;

  const args = message.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (pauseState.isPaused && commandName !== 'play') {
    client.say(channel, `@${tags['display-name']}, les commandes sont actuellement désactivées ⛔`);
    return;
  }

  if (commandes.has(commandName)) {
    try {
      await commandes.get(commandName).execute(
        client,
        channel,
        tags,
        args,
        pauseState
      );
      console.log(`Commande exécutée !${commandName} par ${tags['display-name']}`);
    } catch (err) {
      console.error(`Erreur dans la commande !${commandName}`, err);
    }
  }
});

// =========================
// INTERACTIONS
// =========================
interactions.forEach(interaction => {
  try {
    interaction(client, pauseState);
  } catch (err) {
    console.error('Erreur interaction:', err);
  }
});

// =========================
// PROTECTION GLOBALE
// =========================
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});