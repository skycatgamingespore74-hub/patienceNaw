// fichier : système/points.js
const fs = require("fs");
const path = require("path");

// Chemin vers le fichier qui contient les données des points TikTok
const POINTS_FILE = path.join(__dirname, "../../data/pointsTikTok.json");

// Assure que le fichier existe
if (!fs.existsSync(POINTS_FILE)) {
  fs.writeFileSync(POINTS_FILE, JSON.stringify({}), "utf8");
}

const pointsTikTok = {
  // Récupère les points d'un utilisateur
  getUserPoints(username) {
    const data = JSON.parse(fs.readFileSync(POINTS_FILE, "utf8"));
    const user = username.toLowerCase();

    if (!data[user]) {
      // Si pas de données, renvoie les valeurs par défaut
      return {
        isFan: false,
        likes: 0,
        gifts: 0
      };
    }

    return data[user];
  },

  // Ajoute des likes à un utilisateur
  addLikes(username, count = 1) {
    const data = JSON.parse(fs.readFileSync(POINTS_FILE, "utf8"));
    const user = username.toLowerCase();
    if (!data[user]) data[user] = { isFan: false, likes: 0, gifts: 0 };
    data[user].likes += count;
    fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
  },

  // Ajoute un cadeau
  addGift(username) {
    const data = JSON.parse(fs.readFileSync(POINTS_FILE, "utf8"));
    const user = username.toLowerCase();
    if (!data[user]) data[user] = { isFan: false, likes: 0, gifts: 0 };
    data[user].gifts += 1;
    fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
  },

  // Définit si un utilisateur est fan
  setFan(username, isFan = true) {
    const data = JSON.parse(fs.readFileSync(POINTS_FILE, "utf8"));
    const user = username.toLowerCase();
    if (!data[user]) data[user] = { isFan: false, likes: 0, gifts: 0 };
    data[user].isFan = isFan;
    fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
  }
};

module.exports = pointsTikTok;