const fs = require("fs");
const path = require("path");
const pauseState = require("../système/pause");

const QUEUE_FILE = path.join(__dirname, "../../data/data.json");

module.exports = {
  name: "statue",

  execute(client, channel) {
    // 📋 Lecture de la liste
    let queue = [];
    if (fs.existsSync(QUEUE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
        if (Array.isArray(data)) queue = data;
      } catch {}
    }

    // 🟢 / 🔴 État du bot
    const botState = pauseState.isPaused ? "🔴 Bot en pause" : "🟢 Bot actif";

    // 🎟️ Mode
    const mode = pauseState.stoppoints ? "libre" : "payeur";

    // 📋 Liste
    const listState =
      queue.length === 0
        ? "📭 Liste vide"
        : `📋 ${queue.length} joueur(s) dans la liste`;

    // ✅ Message final
    client.say(
      channel,
      `${botState} | Mode : ${mode} | ${listState}`
    );
  }
};