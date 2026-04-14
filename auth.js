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

// ================================================================
// SETTINGS
// ================================================================
function openSettings(){
  openModal(`
    <h3>Configuración</h3>
    <div class="settings-section">
      <h4>API de Anthropic (para leer PDFs)</h4>
      <div class="field"><label>Clave de API</label><input type="password" id="s-apikey" style="font-family:'IBM Plex Mono',monospace;font-size:12px" placeholder="sk-ant-..." value="${esc(S.apiKey)}"/>
        <div class="field-hint">Obtenela en console.anthropic.com · Se guarda solo en tu equipo</div></div>
    </div>
    <div class="settings-section">
      <h4>☁ Supabase — Fase 2 (nube)</h4>
      <div class="field"><label>URL del proyecto</label><input id="s-sburl" style="font-family:'IBM Plex Mono',monospace;font-size:12px" placeholder="https://xxxx.supabase.co" value="${esc(S.supabaseUrl)}"/></div>
      <div class="field"><label>Anon Key</label><input id="s-sbkey" type="password" style="font-family:'IBM Plex Mono',monospace;font-size:12px" placeholder="eyJhbGci..." value="${esc(S.supabaseKey)}"/>
        <div class="field-hint">Cuando configures Supabase los datos se sincronizan en la nube</div></div>
    </div>
    <div class="settings-section">
      <h4>Datos</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary" onclick="exportData()">Exportar backup (JSON)</button><button class="btn btn-secondary" onclick="document.getElementById('import-file').click()">Importar datos</button><input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)"/></div>
      <div style="font-size:11px;color:var(--text-3);margin-top:.5rem">Hacé backups periódicos</div>
    </div>
    <div class="settings-section">
      <h4>Peligro</h4>
      <button class="btn" style="background:var(--red-light);color:var(--red-dark);border:1px solid #F7C1C1" onclick="if(confirm('¿Resetear TODOS los datos?'))resetData()">Resetear todos los datos</button>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveSettings()">Guardar</button></div>`);
}

function saveSettings(){
  S.apiKey=document.getElementById('s-apikey').value.trim();
  S.supabaseUrl=document.getElementById('s-sburl').value.trim();
  S.supabaseKey=document.getElementById('s-sbkey').value.trim();
  saveState();initSupabase();closeModal();toast('✓ Configuración guardada');
}

function exportData(){
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`alumsystem_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();
}

function importData(inp){
  const file=inp.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{const data=JSON.parse(e.target.result);if(data.pedidos&&data.inv){Object.assign(S,data);saveState();closeModal();render();toast('✓ Datos importados');}else toast('Archivo inválido','error');}
    catch{toast('Error al leer el archivo','error');}
  };reader.readAsText(file);
}

function resetData(){S=JSON.parse(JSON.stringify(DEFAULT_STATE));saveState();closeModal();render();toast('✓ Datos reseteados');}
