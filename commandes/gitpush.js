const { exec } = require("child_process");
const path = require("path");

module.exports = {
  name: "gitpush",
  execute(client, channel, tags) {

    // 🔐 Autorisation
    const allowedUsers = ["acesky_esport"];
    if (!allowedUsers.includes(tags.username.toLowerCase())) {
      client.say(channel, `@${tags["display-name"]}, commande réservée à l’admin ❌`);
      return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      client.say(channel, "❌ GITHUB_TOKEN manquant dans les secrets Replit");
      return;
    }

    client.say(channel, `@${tags["display-name"]}, push GitHub en cours ⏳`);

    const projectPath = path.resolve(__dirname, "..");

    const cmd = `
      cd "${projectPath}" &&
      git init &&
      git branch -M main &&
      git config user.name "skycatgamingespore74-hub" &&
      git config user.email "skycatgaming.espore74@gmail.com" &&
      git remote remove origin || true &&
      git remote add origin https://${token}@github.com/skycatgamingespore74-hub/patienceNaw.git &&
      git add . &&
      git commit -m "mise a jour V5.8" || echo "Aucun changement" &&
      git push origin main
    `;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        client.say(channel, `❌ Push GitHub échoué`);
        return;
      }

      console.log(stdout);
      client.say(channel, `@${tags["display-name"]}, push GitHub réussi ✅`);
    });
  }
};