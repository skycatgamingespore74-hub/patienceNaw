const points = require("../../système/points");

module.exports = (data) => {
  if (!data?.uniqueId) return;

  const coins = data.diamondCount || 0;
  if (coins <= 0) return;

  points.addGift(data.uniqueId, coins);
  console.log(`🎁 ${data.uniqueId} +${coins} pièces`);
};