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

    const projectRoot = path.resolve(__dirname, "..", ".."); // remonte à la racine du workspace

    const cmd = `
      cd "${projectRoot}" &&
      git add . &&
      git commit -m "Mise à jour automatique V11" || echo "Aucun changement" &&
      git push -f https://${token}@github.com/skycatgamingespore74-hub/patienceNaw.git main
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