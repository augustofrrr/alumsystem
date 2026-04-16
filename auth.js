// ================================================================
// LOGIN
// ================================================================
const DEFAULT_USERS = [
  { user:'admin', pass:'aluminio2026', nombre:'Administrador', role:'admin' }
];
function getUsers() { try { return JSON.parse(localStorage.getItem('alumsystem_users')||'null')||DEFAULT_USERS; } catch{ return DEFAULT_USERS; } }
function saveUsers(u) { localStorage.setItem('alumsystem_users', JSON.stringify(u)); }
function getSession() { try { return JSON.parse(sessionStorage.getItem('alumsystem_session')); } catch{ return null; } }
function setSession(u) { sessionStorage.setItem('alumsystem_session', JSON.stringify(u)); }
function clearSession() { sessionStorage.removeItem('alumsystem_session'); }

async function checkLogin() {
  S = loadState();
  initSupabase();
  if (_sb) {
    try {
      const { data:{ user } } = await _sb.auth.getUser();
      if (user) {
        await loadFromCloud();
        showApp({ nombre: user.email.split('@')[0], email: user.email, role:'admin' });
        return;
      }
    } catch(e) {}
  }
  const session = getSession();
  if (session) { showApp(session); return; }
  showLogin();
}

function showLogin(error) {
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('content').innerHTML = '';
  document.getElementById('mc').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:1rem">
      <div style="width:340px">
        <div style="text-align:center;margin-bottom:2rem">
          <div style="display:inline-flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:18px">
            <span style="width:12px;height:12px;border-radius:50%;background:#EF9F27;display:inline-block"></span>
            AlumSystem
          </div>
          <div style="font-size:13px;color:var(--text-2);margin-top:.5rem">Gestión de fábrica de aluminio</div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;box-shadow:0 4px 24px rgba(0,0,0,.07)">
          <div style="font-size:15px;font-weight:500;margin-bottom:1.25rem">Iniciar sesión</div>
          ${error?`<div style="background:var(--red-light);color:var(--red-dark);border:1px solid #F7C1C1;border-radius:var(--radius-sm);padding:.625rem .875rem;font-size:13px;margin-bottom:1rem">${error}</div>`:''}
          <div class="field"><label>Usuario</label><input id="l-user" placeholder="Tu usuario" onkeydown="if(event.key==='Enter')doLogin()"/></div>
          <div class="field"><label>Contraseña</label><input id="l-pass" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()"/></div>
          <button class="btn btn-primary" style="width:100%;margin-top:.5rem;padding:.75rem;font-size:14px" onclick="doLogin()">Ingresar</button>
        </div>
        <div style="text-align:center;margin-top:1.25rem;font-size:12px;color:var(--text-3)">AlumSystem · Integrado con Aludig</div>
      </div>
    </div>`;
  setTimeout(()=>document.getElementById('l-user')?.focus(),100);
}

async function doLogin() {
  const user = document.getElementById('l-user').value.trim().toLowerCase();
  const pass = document.getElementById('l-pass').value;
  if (_sb) {
    try {
      const { data, error } = await _sb.auth.signInWithPassword({ email: user, password: pass });
      if (data?.user) {
        await loadFromCloud();
        showApp({ nombre: data.user.email.split('@')[0], email: data.user.email, role:'admin' });
        return;
      }
    } catch(e) {}
  }
  const found = getUsers().find(u=>u.user.toLowerCase()===user && u.pass===pass);
  if (found) { setSession(found); showApp(found); }
  else showLogin('Usuario o contraseña incorrectos.');
}

async function doLogout() {
  if (_sb) { try { await _sb.auth.signOut(); } catch(e){} }
  clearSession();
  document.getElementById('user-badge')?.remove();
  showLogin();
}

function showApp(session) {
  document.getElementById('mc').innerHTML = '';
  const tb = document.getElementById('topbar');
  tb.style.display = 'flex';
  document.getElementById('user-badge')?.remove();
  const badge = document.createElement('div');
  badge.id = 'user-badge';
  badge.style.cssText = 'display:flex;align-items:center;gap:7px;font-size:13px;color:var(--text-2);cursor:pointer;padding:5px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-surface)';
  badge.innerHTML = `<span style="width:26px;height:26px;border-radius:50%;background:#FAEEDA;color:#854F0B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0">${session.nombre.charAt(0).toUpperCase()}</span><span>${session.nombre}</span>${_sb?`<span class="cloud-dot synced" id="cloud-dot" title="Sincronizado"></span>`:''}`;
  badge.onclick = ()=>openUserMenu(session);
  const gear = document.querySelector('.gear-btn');
  tb.insertBefore(badge, gear);
  render();
}

function openUserMenu(session) {
  openModal(`
    <h3>Mi cuenta</h3>
    <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:.875rem;margin-bottom:1rem">
      <div style="font-size:13px;font-weight:500">${esc(session.nombre)}</div>
      ${session.email?`<div style="font-size:12px;color:var(--text-2);margin-top:2px">${esc(session.email)}</div>`:''}
      <div style="font-size:11px;color:var(--text-3);margin-top:2px">Modo: ${_sb?'☁ Nube (Supabase)':'💾 Local'}</div>
    </div>
    ${!_sb && session.role==='admin'?`<button class="btn btn-secondary" style="width:100%;margin-bottom:.5rem" onclick="closeModal();openManageUsers()">Administrar usuarios</button>`:''}
    <button class="btn" style="width:100%;background:var(--red-light);color:var(--red-dark);border:1px solid #F7C1C1" onclick="closeModal();doLogout()">Cerrar sesión</button>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button></div>`);
}

function openManageUsers() {
  const users = getUsers();
  openModal(`
    <h3>Usuarios del sistema</h3>
    <p class="modal-sub">Cada usuario es una fábrica o persona con acceso.</p>
    <div style="margin-bottom:1rem">
      ${users.map((u,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">${esc(u.nombre)}</div><div style="font-size:11px;color:var(--text-2);font-family:'IBM Plex Mono',monospace">@${esc(u.user)}</div></div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:11px;background:${u.role==='admin'?'var(--blue-light)':'var(--bg-surface)'};color:${u.role==='admin'?'var(--blue-dark)':'var(--text-2)'};padding:2px 8px;border-radius:4px">${u.role}</span>
          ${users.length>1?`<button class="btn-danger" onclick="deleteUser(${i})">✕</button>`:''}
        </div>
      </div>`).join('')}
    </div>
    <button class="btn btn-secondary" style="width:100%" onclick="closeModal();openAddUser()">+ Agregar usuario</button>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cerrar</button></div>`);
}

function openAddUser() {
  openModal(`
    <h3>Agregar usuario</h3>
    <div class="field"><label>Nombre de la fábrica / persona *</label><input id="nu-nombre" placeholder="Ej: Fábrica García"/></div>
    <div class="field"><label>Usuario *</label><input id="nu-user" placeholder="Ej: garcia"/></div>
    <div class="field"><label>Contraseña *</label><input id="nu-pass" type="text" placeholder="Contraseña segura"/></div>
    <div class="field"><label>Rol</label><select id="nu-role"><option value="cliente">cliente</option><option value="admin">admin</option></select></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveNewUser()">Crear</button>
    </div>`);
}

function saveNewUser() {
  const nombre=document.getElementById('nu-nombre').value.trim(), user=document.getElementById('nu-user').value.trim().toLowerCase(), pass=document.getElementById('nu-pass').value.trim(), role=document.getElementById('nu-role').value;
  if(!nombre||!user||!pass){toast('Completá todos los campos','error');return;}
  const users=getUsers();
  if(users.find(u=>u.user===user)){toast('Ese usuario ya existe','error');return;}
  users.push({user,pass,nombre,role}); saveUsers(users); closeModal(); toast(`✓ Usuario "${nombre}" creado`);
}

function deleteUser(i){
  if(!confirm('¿Eliminar este usuario?'))return;
  const users=getUsers(); users.splice(i,1); saveUsers(users); closeModal(); setTimeout(()=>openManageUsers(),100);
}
