module.exports = (client) => {
  client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const cmd = client.commandes.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error(`[HANDLER] Erreur commande ${interaction.commandName}:`, err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Erreur lors de l'exécution de la commande.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Erreur lors de l'exécution de la commande.", ephemeral: true });
      }
    }
  });
};