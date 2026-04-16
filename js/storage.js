// ================================================================
// MATERIALES / PDF
// ================================================================
function goMat(ref){currentAnalysis=null;go('materiales');setTimeout(()=>{const inp=document.getElementById('mat-ref');if(inp)inp.value=ref;},60);}

function rMat(){
  if(currentAnalysis)return rAnalysis();
  const hasKey=!!S.apiKey;
  return`
    <div class="card">
      <div style="font-size:15px;font-weight:500;margin-bottom:.5rem">Analizar materiales de un pedido</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:1.25rem;line-height:1.6">
        Exportá el PDF de <strong>Costos y Ganancias</strong> desde Aludig y subilo acá. El sistema lo cruza con tu stock y genera la orden de compra.
      </div>
      <div class="info" style="margin-bottom:1rem">ℹ En Aludig: abrí el pedido → botón <strong>Costos</strong> → Exportar PDF. Ese es el archivo correcto — no el de Presupuesto.</div>
      ${!hasKey?`<div class="alert" style="margin-bottom:1rem">⚠ Configurá tu clave de API de Anthropic para activar esta función. <span class="link" onclick="openSettings()">Configurar →</span></div>`:''}
      <div style="margin-bottom:1rem">
        <label style="font-size:12px;font-weight:500;color:var(--text-2);display:block;margin-bottom:5px">Referencia del pedido</label>
        <input id="mat-ref" placeholder="O3NAC-5343" style="padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;background:var(--bg-card);color:var(--text);font-family:'DM Sans',sans-serif;width:220px"/>
      </div>
      <div class="upload-zone" id="uz" onclick="document.getElementById('pdf-in').click()" ondragover="uzDrag(event)" ondrop="uzDrop(event)">
        <span class="uz-icon">📄</span>
        <div class="uz-title">Subir PDF de Costos y Ganancias (Aludig)</div>
        <div class="uz-sub">Hacé clic o arrastrá el archivo acá</div>
        <div class="uz-hint">Solo el PDF de "Costos y Ganancias" — no el de Presupuesto</div>
      </div>
      <input type="file" id="pdf-in" accept=".pdf" style="display:none" onchange="handlePDF(this)"/>
    </div>
    ${S.orders.length?`<div><div class="sh"><span class="st">Órdenes de compra (${S.orders.length})</span></div>${S.orders.slice().reverse().map(o=>rOrderCard(o)).join('')}</div>`:''}`;
}

function uzDrag(e){e.preventDefault();document.getElementById('uz').classList.add('drag');}
function uzDrop(e){e.preventDefault();document.getElementById('uz').classList.remove('drag');const f=e.dataTransfer.files[0];if(f&&f.type==='application/pdf')processPDF(f);}
function handlePDF(inp){if(inp.files[0])processPDF(inp.files[0]);}

async function processPDF(file){
  const ref=document.getElementById('mat-ref')?.value||'';
  document.getElementById('content').innerHTML=`<div class="card" style="display:flex;align-items:center;gap:12px;font-size:14px"><div class="spin"></div><div><div style="font-weight:500">Analizando PDF con IA...</div><div style="font-size:12px;color:var(--text-2);margin-top:3px">Identificando materiales y cruzando con tu stock</div></div></div>`;
  if(!S.apiKey){toast('Configurá tu API key en ajustes primero ⚙','error');setTimeout(()=>{currentAnalysis=null;render();},1500);return;}
  const b64=await fileToB64(file);
  const allItems=[];
  Object.entries(S.inv).forEach(([cat,items])=>items.forEach(i=>allItems.push({...i,cat})));
  const stockList=allItems.map(i=>`- ${i.name} (${i.cat}): ${i.qty} ${i.unit}`).join('\n');
  const prompt=`Analizá este PDF de "Costos y Ganancias" de Aludig (software argentino de carpintería de aluminio).

El PDF tiene secciones: "Marco y Hojas", "Revestimientos", "Accesorios". Cada fila tiene: código Aludig (ej: MT-0979), descripción, cantidad (x2), medida corte en mm, costo.

Tu tarea:
1. Extraé TODOS los materiales de las 3 secciones.
2. Perfiles (Marco y Hojas / Revestimientos): calculá barras necesarias. Una barra = 6000mm. Sumá metros lineales del mismo código (cantidad × medida_mm / 1000), dividí por 6, redondear arriba.
3. Accesorios: usá la cantidad directa (x4, x32, etc.).
4. Buscá cada material en el stock actual por código o descripción.

Stock actual:
${stockList}

Respondé SOLO con JSON válido sin texto adicional:
{"pedido":"ref del PDF o null","materiales":[{"codigo":"MT-0979","nombre":"descripción","cantidad_necesaria":número,"unidad":"barras/u/m","detalle":"cálculo resumido","stock_item":"nombre en stock o null","stock_disponible":número o null,"estado":"ok|parcial|falta|no_en_stock","faltante":número}]}`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-opus-4-5',max_tokens:2000,messages:[{role:'user',content:[{type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},{type:'text',text:prompt}]}]})});
    const data=await res.json();
    if(data.error)throw new Error(data.error.message);
    const txt=data.content?.map(c=>c.text||'').join('');
    const parsed=JSON.parse(txt.replace(/```json|```/g,'').trim());
    currentAnalysis={...parsed,ref:ref||parsed.pedido||'',filename:file.name};
    render();
  }catch(e){
    document.getElementById('content').innerHTML=`<div class="alert">⚠ Error: ${esc(e.message||'Error desconocido')}. Verificá tu API key. <span class="link" onclick="currentAnalysis=null;render()">Reintentar</span></div>`;
  }
}

function rAnalysis(){
  const a=currentAnalysis;
  const ok=a.materiales.filter(m=>m.estado==='ok').length;
  const parcial=a.materiales.filter(m=>m.estado==='parcial').length;
  const falta=a.materiales.filter(m=>m.estado==='falta').length;
  const noStock=a.materiales.filter(m=>m.estado==='no_en_stock').length;
  const toOrder=a.materiales.filter(m=>m.estado!=='ok');
  return`
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div><div style="font-size:15px;font-weight:500">Análisis — ${a.ref?esc(a.ref):''}</div><div style="font-size:12px;color:var(--text-3);margin-top:2px">${esc(a.filename)}</div></div>
      <button class="btn btn-secondary" onclick="currentAnalysis=null;render()">← Nuevo análisis</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span class="pill ok">✓ Disponible: ${ok}</span>
      ${parcial?`<span class="pill warn">≈ Parcial: ${parcial}</span>`:''}
      ${falta?`<span class="pill err">✕ Falta: ${falta}</span>`:''}
      ${noStock?`<span class="pill" style="background:var(--gray-light);color:var(--gray-dark)">? Sin registro: ${noStock}</span>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="mtable"><thead><tr>
        <th style="padding-left:1rem">Material</th><th>Necesario</th><th>En stock</th><th>Estado</th><th>Faltante</th>
      </tr></thead><tbody>
      ${a.materiales.map(m=>`<tr>
        <td style="padding-left:1rem">
          ${m.codigo?`<div style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--blue-dark);margin-bottom:2px">${esc(m.codigo)}</div>`:''}
          <div style="font-weight:500">${esc(m.nombre)}</div>
          ${m.detalle?`<div style="font-size:11px;color:var(--text-3);margin-top:1px">${esc(m.detalle)}</div>`:''}
        </td>
        <td><span style="font-family:'IBM Plex Mono',monospace">${m.cantidad_necesaria} ${esc(m.unidad||'')}</span></td>
        <td><span style="font-family:'IBM Plex Mono',monospace">${m.stock_disponible!=null?m.stock_disponible+' '+esc(m.unidad||''):'—'}</span></td>
        <td>${tagHtml(m.estado)}</td>
        <td><span style="font-family:'IBM Plex Mono',monospace;color:${m.faltante>0?'var(--red-dark)':'var(--teal-dark)'}">${m.faltante>0?m.faltante+' '+esc(m.unidad||''):'—'}</span></td>
      </tr>`).join('')}
      </tbody></table>
    </div>
    ${toOrder.length?`<div class="order-box">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.875rem">
        <div><div style="font-size:14px;font-weight:500">Orden de compra sugerida</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">${toOrder.length} ítem(s) para encargar</div></div>
        <span style="background:var(--red-light);color:var(--red-dark);font-size:12px;font-weight:500;padding:3px 10px;border-radius:4px">${toOrder.length} ítems</span>
      </div>
      ${toOrder.map(m=>`<div class="order-row"><div><div class="order-name">${esc(m.nombre)}</div><div class="order-sub">${m.estado==='no_en_stock'?'No registrado en stock':'Stock insuficiente'}</div></div><div class="order-qty">Pedir: ${m.faltante>0?m.faltante:m.cantidad_necesaria} ${esc(m.unidad||'u')}</div></div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="confirmOrder()">✓ Confirmar orden</button>
        <button class="btn btn-secondary" onclick="showPrint()">Ver resumen para proveedor</button>
        <button class="btn btn-secondary" onclick="openAddEgreso({concepto:'Compra materiales '+${JSON.stringify(a.ref||'')},categoria:'Materiales'})">Registrar como gasto</button>
      </div>
    </div>`:`<div class="success">✓ Tenés todo el stock necesario. No hace falta encargar materiales.</div>`}`;
}

function tagHtml(est){const map={ok:['ok','Disponible'],parcial:['parcial','Parcial'],falta:['falta','Falta todo'],no_en_stock:['nocont','Sin registro']};const[cls,label]=map[est]||['nocont',est];return`<span class="tag ${cls}">${label}</span>`;}

function confirmOrder(){
  const a=currentAnalysis;
  const toOrder=a.materiales.filter(m=>m.estado!=='ok');
  S.orders.push({id:S.nextId++,ref:a.ref,date:new Date().toLocaleDateString('es-AR'),filename:a.filename,items:toOrder.map(m=>({name:m.nombre,toOrder:m.faltante>0?m.faltante:m.cantidad_necesaria,unit:m.unidad||'u'}))});
  saveState();currentAnalysis=null;render();toast('✓ Orden de compra guardada');
}

function showPrint(){
  const a=currentAnalysis;
  const toOrder=a.materiales.filter(m=>m.estado!=='ok');
  const today=new Date().toLocaleDateString('es-AR');
  const txt=`ORDEN DE COMPRA\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nReferencia Aludig : ${a.ref||'—'}\nArchivo           : ${a.filename}\nFecha             : ${today}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${toOrder.map(m=>`${m.nombre.substring(0,28).padEnd(28)}  ${String(m.faltante>0?m.faltante:m.cantidad_necesaria).padStart(6)} ${m.unidad||'u'}`).join('\n')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTotal ítems: ${toOrder.length}`;
  openModal(`<h3>Resumen para proveedor</h3><div class="order-print">${esc(txt)}</div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.querySelector('.order-print').innerText).then(()=>toast('✓ Copiado'))">Copiar</button></div>`);
}

function rOrderCard(o){
  return`<div class="order-box" style="margin-bottom:8px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem"><div><div style="font-size:13px;font-weight:500">Orden ${o.ref?`— ${esc(o.ref)}`:`#${o.id}`}</div><div style="font-size:11px;color:var(--text-3);font-family:'IBM Plex Mono',monospace;margin-top:1px">${o.date}</div></div><span style="background:var(--red-light);color:var(--red-dark);font-size:11px;font-weight:500;padding:2px 8px;border-radius:4px">${o.items.length} ítems</span></div>${o.items.map(it=>`<div class="order-row"><div class="order-name">${esc(it.name)}</div><div class="order-qty">Pedir: ${it.toOrder} ${esc(it.unit)}</div></div>`).join('')}</div>`;
}
