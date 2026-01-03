// Objet mutable pour gérer la pause et le système de points
const pauseState = {
  isPaused: false,    // pause globale des commandes
  stoppoints: false   // false = mode payeur actif, true = mode libre
};

module.exports = pauseState;