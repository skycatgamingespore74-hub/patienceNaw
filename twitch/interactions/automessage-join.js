const pauseState = require('../système/pause');

module.exports = (client) => {
  if (!client) return;

  setInterval(() => {
    if (pauseState.isPaused) return;

    client.say(process.env.CHANNEL_NAME, `🎮 N'oubliez pas de rejoindre la queue avec !join !`);
    console.log(`[${new Date().toLocaleTimeString()}] Automessage join envoyé`);
  }, 10 * 60 * 1000);
};