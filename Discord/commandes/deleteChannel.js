// Discord/commandes/deleteChannel.js
const { SlashCommandBuilder, ChannelType } = require('discord.js');

const allowedRoles = process.env.DISCORD_ALLOWED_ROLES
  ? process.env.DISCORD_ALLOWED_ROLES.split(',').map(r => r.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletechannel')
    .setDescription('Supprimer un salon existant dans le serveur')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Choisis le salon à supprimer')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice) // texte ou vocal
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('salon');
    const member = interaction.member;

    // Vérifie permission ManageChannels ou rôle autorisé
    const hasRole = member.roles.cache.some(role => allowedRoles.includes(role.name));
    if (!member.permissions.has('ManageChannels') && !hasRole) {
      return interaction.reply({
        content: '❌ Vous n’avez pas la permission de supprimer ce salon.',
        ephemeral: true
      });
    }

    try {
      await channel.delete(`Supprimé par ${interaction.user.tag}`);
      return interaction.reply({
        content: `✅ Salon supprimé : #${channel.name}`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Erreur suppression salon :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de la suppression du salon.',
        ephemeral: true
      });
    }
  }
};