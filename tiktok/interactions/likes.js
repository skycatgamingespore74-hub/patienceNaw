const points = require("../../système/points");

module.exports = (data) => {
  if (!data?.uniqueId) return;

  const likes = data.likeCount || 1;
  points.addLikes(data.uniqueId, likes);

  console.log(`❤️ ${data.uniqueId} +${likes} likes`);
};