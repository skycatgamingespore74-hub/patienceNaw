// système/logClock.js
module.exports.getTime = () => {
  const now = new Date();
  const offset = 1; // UTC+1
  now.setHours(now.getHours() + offset);
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Nouvelle fonction log
module.exports.log = (message) => {
  console.log(`[${module.exports.getTime()}] ${message}`);
};