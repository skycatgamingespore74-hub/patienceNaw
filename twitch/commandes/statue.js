module.exports = {
  name: "statue",
  async execute(client, channel) {
    if (!global.tiktokStatus) {
      return client.say(channel, "❌ TikTok non initialisé");
    }

    const { connected, lastMessageAt } = global.tiktokStatus;

    let msg = "📊 Statut TikTok → ";

    // 🔌 Connexion
    msg += connected ? "🟢 Connecté" : "🔴 Déconnecté";

    // 💬 Messages
    if (!lastMessageAt) {
      msg += " | ❌ Aucun message reçu";
    } else {
      const diff = Math.floor((Date.now() - lastMessageAt) / 1000);

      if (diff < 30) {
        msg += " | 💬 Messages OK";
      } else {
        msg += ` | ⚠️ Plus de messages (${diff}s)`;
      }
    }

    client.say(channel, msg);
  }
};