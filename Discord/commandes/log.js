const { SlashCommandBuilder } = require("discord.js");
const { setLogChannel } = require("../système/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("Définir le salon pour les logs")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Le salon où envoyer les logs")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    // Définir le salon dans le système de logs
    setLogChannel(channel.id);

    await interaction.reply({ content: `Logs activés pour ${channel.name}`, ephemeral: true });
  },
};