#!/usr/bin/env node
require("dotenv").config();
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🗑️ Suppression des commandes Discord...`);
    await rest.put(
      GUILD_ID
        ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
        : Routes.applicationCommands(CLIENT_ID),
      { body: [] }
    );
    console.log(`✅ Commandes supprimées !`);
  } catch (err) {
    console.error("❌ Erreur lors de la suppression :", err);
  }
})();