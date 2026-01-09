const pauseState = require('../système/pause');

module.exports = (client) => {
  if (!client) return;

  setInterval(() => {
    if (pauseState.isPaused) return;

    client.say(process.env.CHANNEL_NAME, `❌ N'oubliez pas que vous pouvez quitter la liste avec !leave`);
    console.log(`[${new Date().toLocaleTimeString()}] Automessage leave envoyé`);
  }, 12 * 60 * 1000);
};