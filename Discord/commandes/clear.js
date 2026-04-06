const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const ROLE_ID = "1454991544024043804"; // rôle autorisé

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprimer des messages dans le salon")
        .addIntegerOption(option =>
            option.setName("nombre")
                .setDescription("Nombre de messages à supprimer (1-100)")
                .setRequired(true)
        ),

    async execute(interaction) {

        const member = interaction.member;

        // Vérification permission OU rôle
        if (
            !member.permissions.has(PermissionFlagsBits.ManageMessages) &&
            !member.roles.cache.has(ROLE_ID)
        ) {
            return interaction.reply({
                content: "❌ Tu dois avoir la permission **Gérer les messages** ou le rôle autorisé.",
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger("nombre");

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "❌ Choisis un nombre entre 1 et 100.",
                ephemeral: true
            });
        }

        const messages = await interaction.channel.bulkDelete(amount, true);

        await interaction.reply({
            content: `🧹 ${messages.size} messages supprimés.`,
            ephemeral: true
        });

    }
};