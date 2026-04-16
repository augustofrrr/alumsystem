// ================================================================
// SUPABASE
// ================================================================
function initSupabase() {
  if (!S.supabaseUrl || !S.supabaseKey) { _sb = null; return; }
  try { _sb = window.supabase.createClient(S.supabaseUrl, S.supabaseKey); } catch(e) { _sb = null; }
}

async function syncToCloud() {
  if (!_sb) return;
  try {
    const { data:{ user } } = await _sb.auth.getUser();
    if (!user) return;
    updateCloudDot('syncing');
    const payload = { id:user.id, data:JSON.stringify(S), updated_at:new Date().toISOString() };
    await _sb.from('user_data').upsert(payload);
    updateCloudDot('synced');
  } catch(e) { updateCloudDot('offline'); }
}

async function loadFromCloud() {
  if (!_sb) return false;
  try {
    const { data:{ user } } = await _sb.auth.getUser();
    if (!user) return false;
    const { data } = await _sb.from('user_data').select('data').eq('id', user.id).single();
    if (data?.data) { S = { ...DEFAULT_STATE, ...JSON.parse(data.data) }; return true; }
  } catch(e) {}
  return false;
}

function updateCloudDot(status) {
  const dot = document.getElementById('cloud-dot');
  if (!dot) return;
  dot.className = 'cloud-dot ' + status;
  dot.title = status === 'synced' ? 'Sincronizado con la nube' : status === 'syncing' ? 'Guardando...' : 'Sin conexión a la nube';
}
