const { fork } = require("child_process");
const path = require("path");

let bot = null;
let restarting = false;

function start() {
  console.log("🟢 Démarrage index.js");
  bot = fork(path.join(__dirname, "index.js"));

  bot.on("exit", () => {
    bot = null;
    restarting = false;
    console.log("🔴 index.js arrêté");
  });
}

async function restart() {
  if (restarting) return;
  restarting = true;

  console.log("🔄 Restart demandé");

  if (bot) {
    bot.kill("SIGTERM");

    setTimeout(() => {
      if (bot) bot.kill("SIGKILL");
    }, 5000);
  }

  setTimeout(start, 1000);
}

process.on("message", msg => {
  if (msg === "RESTART") restart();
});

start();