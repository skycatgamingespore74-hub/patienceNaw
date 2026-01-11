// fichier : automessageJoin.js
const pauseState = require('../système/pause');

let lastSent = 0; // timestamp du dernier message
const INTERVAL = 10 * 60 * 1000; // 10 minutes

module.exports = (client) => {
  if (!client) return;

  setInterval(() => {
    if (pauseState.isPaused) return;

    const now = Date.now();
    if (now - lastSent < INTERVAL) return; // empêche les doublons

    client.say(process.env.CHANNEL_NAME, `🎮 N'oubliez pas de rejoindre la queue avec !join !`);
    console.log(`[${new Date().toLocaleTimeString()}] Automessage join envoyé`);
    lastSent = now;
  }, 1000); // check toutes les secondes, mais envoie toutes les 10 min max
};