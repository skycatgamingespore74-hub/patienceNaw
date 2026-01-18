const points = require("../../système/points");

module.exports = (data) => {
  if (!data?.uniqueId) return;

  points.setFan(data.uniqueId, true);
  console.log(`⭐ ${data.uniqueId} est maintenant fan`);
};