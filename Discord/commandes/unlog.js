const { SlashCommandBuilder } = require("discord.js");
const { setLogChannel } = require("../système/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlog")
    .setDescription("Désactiver le salon de logs"),

  async execute(interaction) {
    setLogChannel(null);
    await interaction.reply({ content: "Logs désactivés.", ephemeral: true });
  },
};