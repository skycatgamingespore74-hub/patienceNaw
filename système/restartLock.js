let locked = false;

function canRestart() {
  if (locked) return false;
  locked = true;

  setTimeout(() => {
    locked = false;
  }, 10_000); // 10 secondes

  return true;
}

module.exports = { canRestart };