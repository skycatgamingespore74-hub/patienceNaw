// logger.js
let initialized = false;

function initLogger(sendToDiscord) {
  if (initialized) return;
  initialized = true;

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => {
    originalLog(...args);
    sendToDiscord?.("log", args.join(" "));
  };

  console.warn = (...args) => {
    originalWarn(...args);
    sendToDiscord?.("warn", args.join(" "));
  };

  console.error = (...args) => {
    originalError(...args);
    sendToDiscord?.("error", args.join(" "));
  };
}

module.exports = { initLogger };