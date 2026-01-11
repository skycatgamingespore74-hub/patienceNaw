// fichier : automessage-leave.js
const pauseState = require('../système/pause');

let lastSent = 0; // timestamp du dernier message
const INTERVAL = 12 * 60 * 1000; // 12 minutes

module.exports = (client) => {
  if (!client) return;

  setInterval(() => {
    if (pauseState.isPaused) return;

    const now = Date.now();
    if (now - lastSent < INTERVAL) return; // empêche les doublons

    client.say(
      process.env.CHANNEL_NAME,
      `❌ N'oubliez pas que vous pouvez quitter la liste avec !leave`
    );
    console.log(`[${new Date().toLocaleTimeString()}] Automessage leave envoyé`);
    lastSent = now;
  }, 1000); // vérifie toutes les secondes
};