const { spawn } = require('child_process');
const path = require('path');

let tiktokProcess = null;
let isRunning = false;

/**
 * Démarre le bot TikTok si ce n'est pas déjà lancé
 * @returns {boolean} true si lancé, false si déjà en cours
 */
function startTikTok() {
  if (isRunning) return false;

  const indexPath = path.join(__dirname, '../tiktok/index.js');
  tiktokProcess = spawn('node', [indexPath], { stdio: 'inherit' });

  tiktokProcess.on('close', (code, signal) => {
    console.log(`[TikTok] Process terminé (code: ${code}, signal: ${signal})`);
    tiktokProcess = null;
    isRunning = false;
  });

  tiktokProcess.on('error', (err) => {
    console.error('[TikTok] Erreur du process :', err);
    tiktokProcess = null;
    isRunning = false;
  });

  isRunning = true;
  console.log('[TikTok] Process démarré');
  return true;
}

/**
 * Stoppe le bot TikTok si il est lancé
 * @returns {boolean} true si arrêté, false si pas lancé
 */
function stopTikTok() {
  if (!isRunning || !tiktokProcess) return false;

  tiktokProcess.kill();
  tiktokProcess = null;
  isRunning = false;
  console.log('[TikTok] Process arrêté');
  return true;
}

/**
 * Retourne l'état actuel du TikTok process
 * @returns {boolean} true si en cours, false sinon
 */
function getStatus() {
  return isRunning;
}

module.exports = {
  startTikTok,
  stopTikTok,
  getStatus,
};