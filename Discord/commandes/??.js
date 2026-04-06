const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Informations sur PatienceNaw"),

    async execute(interaction) {

        const embed = {
            color: 0x8e44ad,
            title: "🤖 PatienceNaw",
            description: "Bot de gestion de file d’attente multi-plateforme.",
            fields: [
                { name: "Plateformes", value: "Twitch • TikTok • Discord", inline: true },
                { name: "Statut", value: "Stable", inline: true },
                { name: "Fonction principale", value: "Gestion de file d'attente et points." }
            ],
            footer: {
                text: "PatienceNaw System"
            }
        };

        await interaction.reply({ embeds: [embed] });

    }
};