// fichier : automessage-join.js
const pauseState = require('../système/pause');

let started = false;
let lastSent = 0;
const INTERVAL = 15 * 60 * 1000; // 15 minutes

module.exports = {
  execute({ client }) {
    if (started) return; // empêche double interval
    started = true;

    if (!client) return;

    setInterval(() => {
      if (pauseState.isPaused) return;

      const now = Date.now();
      if (now - lastSent < INTERVAL) return;

      client.say(
        process.env.CHANNEL_NAME,
        "🎮 N'oubliez pas de rejoindre la queue avec !join ! ❌ Et vous pouvez quitter la liste avec !leave !"
      );

      console.log(
        `[${new Date().toLocaleTimeString()}] Automessage join/leave envoyé`
      );

      lastSent = now;
    }, 1000);
  }
};