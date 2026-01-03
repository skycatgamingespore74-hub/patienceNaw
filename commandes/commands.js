module.exports = {
  name: 'commands',
  execute(client, channel, tags) {
    const username = tags.username.toLowerCase();

    // Liste des commandes accessibles aux viewers
    const commandsList = [
      '!join - Rejoindre la file d\'attente',
      '!leave - Quitter la file d\'attente',
      '!list - Voir la file d\'attente',
      '!commands - Voir cette liste de commandes '
    ];

    client.say(
      channel,
      `@${tags['display-name']}, commandes disponibles : ${commandsList.join(' | ')} | Les commandes modérateur sont communiquées sur Discord.`
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] 📝 Commandes listées pour ${tags['display-name']}`
    );
  }
};