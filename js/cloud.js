// ================================================================
// BALANCE
// ================================================================
function getCurrentMonth(){ const n=new Date(); return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; }
function monthLabel(ym){ const [y,m]=ym.split('-'); const names=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; return`${names[+m-1]} ${y}`; }
function prevMonth(ym){ const d=new Date(ym+'-01'); d.setMonth(d.getMonth()-1); return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function nextMonth(ym){ const d=new Date(ym+'-01'); d.setMonth(d.getMonth()+1); return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function rTxnList(txns, withActions){
  return txns.map(t=>{
    const isIn=t.tipo==='ingreso';
    const cat=isIn?'Cobro':t.categoria;
    const catStyle=CAT_COLORS[cat]||'background:var(--bg-surface);color:var(--text-2)';
    return`<div class="txn-row">
      <div class="txn-date">${t.fecha.slice(8)+'/'+(t.fecha.slice(5,7))}</div>
      <span class="txn-cat" style="${catStyle}">${esc(cat)}</span>
      <div class="txn-body">
        <div class="txn-concept">${esc(t.concepto)}</div>
        <div class="txn-detail">${esc(isIn?(t.cliente||''):(t.proveedor||''))}${t.ref?` · ${esc(t.ref)}`:''}</div>
      </div>
      <div class="txn-amount" style="color:${isIn?'var(--teal-dark)':'var(--red-dark)'}">
        ${isIn?'+':'−'}${formatARS(t.monto)}
      </div>
      ${withActions?`<div class="txn-actions">
        <button class="btn-danger" onclick="delTxn('${t.tipo}',${t.id})">✕</button>
      </div>`:''}
    </div>`;
  }).join('');
}

function openAddIngreso(prefill){
  const today=new Date().toISOString().slice(0,10);
  const p=prefill||{};
  openModal(`
    <h3>Registrar cobro</h3>
    <p class="modal-sub">Ingresá el pago recibido por un trabajo entregado.</p>
    <div class="field"><label>Concepto *</label><input id="ai-concepto" value="${esc(p.concepto||'')}" placeholder="Ej: Ventana corrediza 1.2×1.0m"/></div>
    <div class="field"><label>Cliente</label><input id="ai-cliente" value="${esc(p.cliente||'')}" placeholder="Nombre del cliente"/></div>
    <div class="field-row">
      <div class="field"><label>Monto ($ ARS) *</label><input id="ai-monto" type="number" value="${p.monto||''}" placeholder="130000"/></div>
      <div class="field"><label>Fecha *</label><input id="ai-fecha" type="date" value="${p.fecha||today}"/></div>
    </div>
    <div class="field"><label>Ref. Aludig</label><input id="ai-ref" value="${esc(p.ref||'')}" placeholder="O3NAC-5343"/></div>
    <div class="field"><label>Observaciones</label><input id="ai-obs" value="${esc(p.obs||'')}" placeholder=""/></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="saveIngreso()">Registrar cobro</button>
    </div>`);
}

function openAddEgreso(prefill){
  const today=new Date().toISOString().slice(0,10);
  const p=prefill||{};
  openModal(`
    <h3>Registrar gasto</h3>
    <p class="modal-sub">Ingresá un gasto o compra realizada.</p>
    <div class="field"><label>Concepto *</label><input id="ae-concepto" value="${esc(p.concepto||'')}" placeholder="Ej: Perfiles MT-0979"/></div>
    <div class="field"><label>Categoría</label>
      <select id="ae-cat">${CATS_EGRESO.map(c=>`<option value="${c}" ${p.categoria===c?'selected':''}>${c}</option>`).join('')}</select>
    </div>
    <div class="field-row">
      <div class="field"><label>Monto ($ ARS) *</label><input id="ae-monto" type="number" value="${p.monto||''}" placeholder="45000"/></div>
      <div class="field"><label>Fecha *</label><input id="ae-fecha" type="date" value="${p.fecha||today}"/></div>
    </div>
    <div class="field"><label>Proveedor</label><input id="ae-prov" value="${esc(p.proveedor||'')}" placeholder="Nombre del proveedor"/></div>
    <div class="field"><label>Observaciones</label><input id="ae-obs" value="${esc(p.obs||'')}" placeholder=""/></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveEgreso()">Registrar gasto</button>
    </div>`);
}

function saveIngreso(){
  const concepto=document.getElementById('ai-concepto').value.trim();
  const monto=parseFloat(document.getElementById('ai-monto').value);
  if(!concepto||!monto){toast('Completá concepto y monto','error');return;}
  S.balance.ingresos.push({id:S.nextBalId++,concepto,cliente:document.getElementById('ai-cliente').value.trim(),monto,fecha:document.getElementById('ai-fecha').value,ref:document.getElementById('ai-ref').value.trim(),obs:document.getElementById('ai-obs').value.trim()});
  saveState();closeModal();
  if(currentTab==='balance')render();
  else{balanceMonth=document.getElementById('ai-fecha').value.slice(0,7);go('balance');}
  toast('✓ Cobro registrado');
}

function saveEgreso(){
  const concepto=document.getElementById('ae-concepto').value.trim();
  const monto=parseFloat(document.getElementById('ae-monto').value);
  if(!concepto||!monto){toast('Completá concepto y monto','error');return;}
  S.balance.egresos.push({id:S.nextBalId++,concepto,categoria:document.getElementById('ae-cat').value,monto,fecha:document.getElementById('ae-fecha').value,proveedor:document.getElementById('ae-prov').value.trim(),obs:document.getElementById('ae-obs').value.trim()});
  saveState();closeModal();
  if(currentTab==='balance')render();
  else{balanceMonth=document.getElementById('ae-fecha').value.slice(0,7);go('balance');}
  toast('✓ Gasto registrado');
}

function delTxn(tipo,id){
  if(!confirm('¿Eliminar este movimiento?'))return;
  if(tipo==='ingreso')S.balance.ingresos=S.balance.ingresos.filter(i=>i.id!==id);
  else S.balance.egresos=S.balance.egresos.filter(e=>e.id!==id);
  saveState();render();toast('Movimiento eliminado');
}
