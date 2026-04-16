// ================================================================
// PERSISTENCIA
// ================================================================
function loadState() {
  try {
    const saved = localStorage.getItem('alumsystem_v2');
    if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try { localStorage.setItem('alumsystem_v2', JSON.stringify(S)); } catch(e) {}
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(syncToCloud, 1500);
}
