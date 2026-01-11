// Discord/commandes/createChannel.js
const { SlashCommandBuilder } = require('discord.js');

const allowedRoles = process.env.DISCORD_ALLOWED_ROLES
  ? process.env.DISCORD_ALLOWED_ROLES.split(',').map(r => r.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createchannel')
    .setDescription('Créer un nouveau salon texte dans le serveur')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom du salon à créer')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channelName = interaction.options.getString('nom');

    try {
      const member = interaction.member;

      // Vérifie permission ManageChannels ou rôle autorisé
      const hasRole = member.roles.cache.some(role => allowedRoles.includes(role.name));
      if (!member.permissions.has('ManageChannels') && !hasRole) {
        return interaction.reply({
          content: '❌ Vous n’avez pas la permission de créer un salon.',
          ephemeral: true
        });
      }

      // Création du salon texte
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: 0 // 0 = GUILD_TEXT pour Discord.js v14
      });

      return interaction.reply({
        content: `✅ Salon créé : #${channel.name}`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Erreur création salon :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de la création du salon.',
        ephemeral: true
      });
    }
  }
};