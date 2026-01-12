// fichier : automessage-join.js
const pauseState = require('../système/pause');

let lastSent = 0; // timestamp du dernier message
const INTERVAL = 15 * 60 * 1000; // 15 minutes

module.exports = (client) => {
  if (!client) return;

  setInterval(() => {
    if (pauseState.isPaused) return;

    const now = Date.now();
    if (now - lastSent < INTERVAL) return; // empêche les doublons

    client.say(
      process.env.CHANNEL_NAME,
      "🎮 N'oubliez pas de rejoindre la queue avec !join ! ❌ Et vous pouvez quitter la liste avec !leave !"
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] Automessage join/leave envoyé`
    );

    lastSent = now;
  }, 1000); // check chaque seconde, envoi max toutes les 15 min
};