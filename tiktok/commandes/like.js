const fs = require("fs");
const path = require("path");

const DATA_LIKE_FILE = path.join(__dirname, "../../data/data-like.json");

module.exports = {
  name: "like",

  execute(ctx) {
    if (!ctx?.send || !ctx.username) return;

    let likeData = {};
    if (fs.existsSync(DATA_LIKE_FILE)) {
      try {
        likeData = JSON.parse(fs.readFileSync(DATA_LIKE_FILE, "utf8"));
      } catch {
        likeData = {};
      }
    }

    const username = ctx.username;
    const totalLikes = likeData[username] || 0;

    ctx.send(`❤️ ${username} a envoyé ${totalLikes} like(s) pendant le live`);
    console.log(`❤️ ${username} a envoyé ${totalLikes} like(s) pendant le live`);
  }
};