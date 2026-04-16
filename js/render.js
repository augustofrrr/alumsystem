// ================================================================
// NAVEGACIÓN
// ================================================================
function go(tab) {
  currentTab=tab;
  document.querySelectorAll('.nb').forEach((b,i)=>b.classList.toggle('on',['dashboard','pedidos','balance','materiales','inventario'][i]===tab));
  if(tab!=='materiales')currentAnalysis=null;
  if(tab==='balance'&&!balanceMonth)balanceMonth=getCurrentMonth();
  render();
}

// ================================================================
// RENDER
// ================================================================
function render() {
  const el=document.getElementById('content');
  if(currentTab==='dashboard')  el.innerHTML=rDash();
  if(currentTab==='pedidos')    el.innerHTML=rPed();
  if(currentTab==='balance')    el.innerHTML=rBalance();
  if(currentTab==='materiales') el.innerHTML=rMat();
  if(currentTab==='inventario') el.innerHTML=rInv();
}

// ================================================================
// FLOW BANNER
// ================================================================
function flowBanner(){
  const steps=[{l:'Presupuesto',c:'#1e40af',bg:'#dbeafe'},{l:'Aprobado',c:'#854F0B',bg:'#FAEEDA'},{l:'En producción',c:'#0F6E56',bg:'#E1F5EE'},{l:'Listo',c:'#3B6D11',bg:'#EAF3CE'},{l:'Entregado',c:'#5F5E5A',bg:'#F1EFE8'}];
  return`<div class="flow">${steps.map((s,i)=>`${i?'<span class="fa">›</span>':''}<div class="fs"><div class="fi" style="background:${s.bg};color:${s.c}">${i===0?'A':i}</div><span style="color:${s.c}">${s.l}</span></div>`).join('')}</div>`;
}

// ================================================================
// DASHBOARD
// ================================================================
function rDash(){
  const L=getLow();
  const m=getCurrentMonth();
  const ingresosMes=S.balance.ingresos.filter(i=>i.fecha.startsWith(m)).reduce((s,i)=>s+i.monto,0);
  const egresosMes=S.balance.egresos.filter(e=>e.fecha.startsWith(m)).reduce((s,e)=>s+e.monto,0);
  return`
    ${flowBanner()}
    <div class="stats">
      <div class="sc"><div class="sl">Pedidos activos</div><div class="sv">${S.pedidos.length}</div></div>
      <div class="sc"><div class="sl">En producción</div><div class="sv am">${S.pedidos.filter(p=>p.stage===1).length}</div></div>
      <div class="sc"><div class="sl">Ingresos del mes</div><div class="sv tl" style="font-size:16px">${formatARS(ingresosMes)}</div></div>
      <div class="sc"><div class="sl">Stock bajo</div><div class="sv ${L.length?'rd':''}">${L.length}</div></div>
    </div>
    ${L.length?`<div class="alert">⚠ ${L.length} material(es) con stock bajo — <span class="link" onclick="go('inventario')">ver stock →</span></div>`:''}
    <div><div class="sh"><span class="st">Estado de pedidos</span></div>${rKanban(false)}</div>
    ${S.balance.ingresos.length||S.balance.egresos.length?`
    <div><div class="sh"><span class="st">Últimos movimientos</span><button class="btn btn-secondary" style="font-size:12px;padding:5px 12px" onclick="go('balance')">Ver balance →</button></div>
    ${rTxnList([...S.balance.ingresos.map(i=>({...i,tipo:'ingreso'})),...S.balance.egresos.map(e=>({...e,tipo:'egreso'}))].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,5),false)}
    </div>`:''}`;
}

// ================================================================
// PEDIDOS
// ================================================================
function rPed(){
  return`
    ${flowBanner()}
    <div class="info">ℹ Generá el presupuesto en Aludig, y cuando el cliente apruebe ingresalo acá.
      <a href="https://aludig.com.ar" target="_blank">Ir a Aludig →</a>
    </div>
    <div><div class="sh"><span class="st">Pedidos activos (${S.pedidos.length})</span>
      <button class="btn btn-primary" onclick="openAddPedido()">+ Ingresar pedido aprobado</button>
    </div>${rKanban(true)}</div>`;
}

function rKanban(btns){
  return`<div class="kanban">${STAGES.map((s,i)=>{
    const cards=S.pedidos.filter(p=>p.stage===i);
    return`<div class="col"><div class="col-header"><span class="col-title" style="color:${STAGE_C[i]}">${s}</span><span class="col-count">${cards.length}</span></div>
    ${cards.length?cards.map(p=>`<div class="kcard">
      <div class="kcard-client">${esc(p.client)}</div>
      <div class="kcard-desc">${esc(p.desc)}</div>
      ${p.ref?`<div class="kcard-ref" onclick="goMat('${esc(p.ref)}')" title="Analizar materiales">⊞ ${esc(p.ref)}</div>`:''}
      ${p.obs?`<div style="font-size:11px;color:#854F0B;margin-top:5px;font-style:italic">${esc(p.obs)}</div>`:''}
      <div class="kcard-date">${formatDate(p.date)}</div>
      ${btns?`<div class="kcard-btns">
        ${i>0?`<button class="mb" onclick="mvCard(${p.id},-1)">← Atrás</button>`:''}
        ${i<3?`<button class="mb" onclick="mvCard(${p.id},1)" style="color:${STAGE_C[Math.min(3,i+1)]}">Avanzar →</button>`:''}
        <button class="mb" onclick="editPedido(${p.id})">✎</button>
        <button class="btn-danger" onclick="delPedido(${p.id})">✕</button>
      </div>`:''}
    </div>`).join(''):'<div class="empty-col">Sin pedidos</div>'}
    </div>`;
  }).join('')}</div>`;
}

// ================================================================
// BALANCE
// ================================================================
function rBalance(){
  if(!balanceMonth)balanceMonth=getCurrentMonth();
  const m=balanceMonth;
  const ing=S.balance.ingresos.filter(i=>i.fecha.startsWith(m));
  const egr=S.balance.egresos.filter(e=>e.fecha.startsWith(m));
  const totalIn=ing.reduce((s,i)=>s+i.monto,0);
  const totalEg=egr.reduce((s,e)=>s+e.monto,0);
  const res=totalIn-totalEg;
  const isPos=res>=0;
  const allTxn=[...ing.map(i=>({...i,tipo:'ingreso'})),...egr.map(e=>({...e,tipo:'egreso'}))].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const bycat={};
  egr.forEach(e=>{ bycat[e.categoria]=(bycat[e.categoria]||0)+e.monto; });
  const topcat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return`
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div class="month-nav">
        <button class="month-btn" onclick="balanceMonth='${prevMonth(m)}';render()">‹</button>
        <div class="month-label">${monthLabel(m)}</div>
        <button class="month-btn" onclick="balanceMonth='${nextMonth(m)}';render()">›</button>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-success" onclick="openAddIngreso()">+ Cobro</button>
        <button class="btn btn-primary" onclick="openAddEgreso()">+ Gasto</button>
      </div>
    </div>
    <div class="bal-stats">
      <div class="bal-sc" style="background:var(--teal-light);border-color:#9FE1CB">
        <div class="bal-label" style="color:var(--teal-dark)">Ingresos</div>
        <div class="bal-value" style="color:var(--teal-dark)">${formatARS(totalIn)}</div>
        <div class="bal-sub" style="color:var(--teal-dark)">${ing.length} cobro(s)</div>
      </div>
      <div class="bal-sc" style="background:var(--red-light);border-color:#F7C1C1">
        <div class="bal-label" style="color:var(--red-dark)">Egresos</div>
        <div class="bal-value" style="color:var(--red-dark)">${formatARS(totalEg)}</div>
        <div class="bal-sub" style="color:var(--red-dark)">${egr.length} gasto(s)</div>
      </div>
      <div class="bal-sc" style="background:${isPos?'var(--teal-light)':'var(--red-light)'};border-color:${isPos?'#9FE1CB':'#F7C1C1'}">
        <div class="bal-label" style="color:${isPos?'var(--teal-dark)':'var(--red-dark)'}">Resultado</div>
        <div class="bal-value" style="color:${isPos?'var(--teal-dark)':'var(--red-dark)'};">${isPos?'+':''}${formatARS(res)}</div>
        <div class="bal-sub" style="color:${isPos?'var(--teal-dark)':'var(--red-dark)'};">${totalIn>0?Math.round((res/totalIn)*100)+'% margen':'—'}</div>
      </div>
    </div>
    ${topcat.length?`<div class="card" style="padding:.875rem 1.25rem">
      <div style="font-size:12px;font-weight:500;color:var(--text-2);margin-bottom:.625rem;text-transform:uppercase;letter-spacing:.07em">Egresos por categoría</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${topcat.map(([cat,monto])=>`<div style="display:flex;align-items:center;gap:6px;background:var(--bg-surface);border-radius:var(--radius-sm);padding:5px 10px">
          <span style="font-size:12px;font-weight:500">${esc(cat)}</span>
          <span style="font-size:12px;font-family:'IBM Plex Mono',monospace;color:var(--red-dark)">${formatARS(monto)}</span>
        </div>`).join('')}
        ${Object.keys(bycat).length>3?`<div style="font-size:12px;color:var(--text-3);padding:5px 4px">+${Object.keys(bycat).length-3} más</div>`:''}
      </div>
    </div>`:''}
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:.875rem 1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:13px;font-weight:500">Movimientos — ${monthLabel(m)}</div>
        <div style="font-size:12px;color:var(--text-2)">${allTxn.length} registro(s)</div>
      </div>
      <div style="padding:.25rem .5rem">
        ${allTxn.length?rTxnList(allTxn,true):`<div class="empty-col" style="padding:2rem">Sin movimientos este mes</div>`}
      </div>
    </div>`;
}

// ================================================================
// INVENTARIO
// ================================================================
function rInv(){
  const L=getLow();
  return`
    ${L.length?`<div class="alert">⚠ Stock bajo: ${L.map(i=>esc(i.name)).join(', ')}</div>`:''}
    <div><div class="sh"><span class="st">Stock actual</span></div>
    <div class="inv-grid">${INV_SECS.map(sec=>{
      const items=S.inv[sec.k];
      return`<div class="inv-section"><div class="inv-sec-title"><span style="width:10px;height:10px;border-radius:2px;background:${sec.c};display:inline-block;flex-shrink:0"></span>${sec.l}</div>
      ${items.map(it=>`<div class="inv-row"><div><div class="inv-name">${esc(it.name)}</div><div class="inv-min">mín: ${it.min} ${esc(it.unit)}</div></div>
      <div class="inv-controls"><button class="qb" onclick="updQty('${sec.k}',${it.id},-1)">−</button><span class="iq ${it.qty<=it.min?'lo':'ok'}">${it.qty}</span><button class="qb" onclick="updQty('${sec.k}',${it.id},1)">+</button><button class="btn-danger" onclick="delItem('${sec.k}',${it.id})">✕</button></div></div>`).join('')}
      <div style="margin-top:8px"><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px" onclick="openAddItem('${sec.k}','${sec.l}')">+ Agregar</button></div></div>`;
    }).join('')}</div></div>`;
}
