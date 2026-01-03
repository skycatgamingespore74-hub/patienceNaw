const fs = require('fs');
const fetch = require('node-fetch');

module.exports = async (client) => {
  // =========================
  // VARIABLES DU .ENV
  // =========================
  const BOT_USERNAME = process.env.BOT_USERNAME;  // Nom du bot (chat)
  const BOT_TOKEN = process.env.BOT_TOKEN;        // Token du bot (chat)
  const API_CLIENT_ID = process.env.API_CLIENT_ID; // Client ID de la chaîne
  const API_TOKEN = process.env.API_TOKEN.replace('oauth:', ''); // Token de la chaîne (API)
  const CHANNEL_NAME = process.env.CHANNEL_NAME;  // Nom de la chaîne
  const REWARD_ID = process.env.REWARD_ID;        // ID de la récompense
  const PAID_FILE = './paidUsers.json';           // Fichier des payeurs

  // =========================
  // 1️⃣ Récupérer l'ID de la chaîne
  // =========================
  async function getBroadcasterId() {
    try {
      const res = await fetch(
        `https://api.twitch.tv/helix/users?login=${CHANNEL_NAME}`,
        {
          headers: {
            'Client-ID': API_CLIENT_ID,
            'Authorization': `Bearer ${API_TOKEN}`
          }
        }
      );
      const data = await res.json();
      if (!data.data || data.data.length === 0) {
        console.log(`[${new Date().toLocaleTimeString()}] ❌ Impossible de récupérer l'ID de la chaîne`);
        console.log(data);
        return null;
      }
      return data.data[0].id;
    } catch (err) {
      console.log('❌ Erreur getBroadcasterId:', err);
      return null;
    }
  }

  const broadcasterId = await getBroadcasterId();
  if (!broadcasterId) return;

  // =========================
  // 2️⃣ Récupérer les anciens payeurs
  // =========================
  async function fetchOldPayees() {
    try {
      const url =
        `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions` +
        `?broadcaster_id=${broadcasterId}` +
        `&reward_id=${REWARD_ID}` +
        `&status=FULFILLED`;

      const res = await fetch(url, {
        headers: {
          'Client-ID': API_CLIENT_ID,
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });

      const data = await res.json();
      if (!data.data) {
        console.log(`[${new Date().toLocaleTimeString()}] ❌ Impossible de récupérer les anciens payeurs`);
        console.log(data);
        return;
      }

      const users = [...new Set(data.data.map(r => r.user_login))];

      fs.writeFileSync(PAID_FILE, JSON.stringify(users, null, 2));
      console.log(`[${new Date().toLocaleTimeString()}] ✅ ${users.length} anciens payeurs chargés`);
    } catch (err) {
      console.log('❌ Erreur fetchOldPayees:', err);
    }
  }

  await fetchOldPayees();

  // =========================
  // 3️⃣ Écouter les nouveaux paiements
  // =========================
  client.on('redeem', (channel, username, reward, tags) => {
    if (reward.title !== 'Jouer à Brawl Stars') return;

    let paidUsers = [];
    if (fs.existsSync(PAID_FILE)) {
      paidUsers = JSON.parse(fs.readFileSync(PAID_FILE));
    }

    if (!paidUsers.includes(username)) {
      paidUsers.push(username);
      fs.writeFileSync(PAID_FILE, JSON.stringify(paidUsers, null, 2));
    }

    client.say(
      channel,
      `@${username} merci pour les points ! Tu peux rejoindre à l'infini 🎮`
    );

    console.log(`[${new Date().toLocaleTimeString()}] 💎 ${username} a payé (accès infini)`);
  });
};