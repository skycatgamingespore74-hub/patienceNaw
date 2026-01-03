const { exec } = require('child_process');
const path = require('path');

module.exports = {
  name: 'gitpush',
  execute(client, channel, tags) {
    const allowedUser = ['acesky_esport'];
    if (!allowedUser.includes(tags.username.toLowerCase())) {
      client.say(channel, `@${tags['display-name']}, vous n'êtes pas autorisé à utiliser cette commande.`);
      return;
    }

    client.say(channel, `@${tags['display-name']}, début du push GitHub... ⏳`);

    const projectPath = path.resolve(__dirname, '..');

    // Commande shell sécurisée
    const gitCommands = `
      cd "${projectPath}" &&
      git init &&
      git config user.name "skycatgamingespore74-hub" &&
      git config user.email "skycatgaming.espore74@gmail.com" &&
      git remote remove origin || true &&
      git remote add origin https://github.com/skycatgamingespore74-hub/Anger.git &&
      git fetch origin main &&
      git checkout -b main || git checkout main &&
      git add . ':!node_modules' ':!package-lock.json' &&
      git commit -m "Push automatique depuis Replit" || echo "Aucun changement à commit" &&
      git push -u origin main
    `;

    exec(gitCommands, (error, stdout, stderr) => {
      if (error) {
        console.error('Erreur Git:', error);
        console.log(stderr);
        client.say(channel, `@${tags['display-name']}, push GitHub échoué ❌ Vérifie le token ou l'accès.`);
        return;
      }

      // Extraire fichiers ajoutés ou modifiés
      const files = stdout.match(/(?:new file|modified):\s+(.+)/g)?.map(l => l.replace(/(?:new file|modified):\s+/, '')) || [];

      files.forEach((file, i) => {
        setTimeout(() => {
          client.say(channel, `📄 ${file} ajouté/modifié !`);
        }, i * 1200);
      });

      client.say(channel, `@${tags['display-name']}, push GitHub terminé ✅`);
      console.log(`[${new Date().toLocaleTimeString()}] Git push effectué par ${tags['display-name']}`);
    });
  }
};