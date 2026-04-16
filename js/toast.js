// ================================================================
// ACCIONES
// ================================================================
function mvCard(id,dir){
  const p=S.pedidos.find(x=>x.id===id);
  if(!p)return;
  p.stage=Math.max(0,Math.min(3,p.stage+dir));
  saveState();render();
  // Si avanzó a Entregado, sugerir registrar cobro
  if(p.stage===3){
    setTimeout(()=>{
      toast(`¿Registrar cobro por ${esc(p.client)}?`);
      setTimeout(()=>openAddIngreso({concepto:p.desc,cliente:p.client,ref:p.ref,fecha:new Date().toISOString().slice(0,10)}),400);
    },300);
  }
}

function delPedido(id){if(!confirm('¿Eliminar este pedido?'))return;S.pedidos=S.pedidos.filter(p=>p.id!==id);saveState();render();toast('Pedido eliminado');}

function openAddPedido(){
  const today=new Date().toISOString().slice(0,10);
  openModal(`
    <h3>Ingresar pedido aprobado</h3>
    <p class="modal-sub">Completá con los datos del presupuesto aprobado en Aludig.</p>
    <div class="field"><label>Nro. referencia Aludig</label><input id="f-ref" placeholder="O3NAC-5343"/><div class="field-hint">Para cruzar con materiales y balance</div></div>
    <div class="field"><label>Cliente / Obra *</label><input id="f-client" placeholder="Nombre del cliente"/></div>
    <div class="field"><label>Descripción *</label><textarea id="f-desc" placeholder="Tipo de aberturas, medidas, línea..."></textarea></div>
    <div class="field"><label>Observaciones</label><input id="f-obs" placeholder="Urgencia, notas..."/></div>
    <div class="field"><label>Fecha de ingreso</label><input id="f-date" type="date" value="${today}"/></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="savePedido()">Ingresar pedido</button></div>`);
}

function editPedido(id){
  const p=S.pedidos.find(x=>x.id===id);if(!p)return;
  openModal(`
    <h3>Editar pedido</h3>
    <div class="field"><label>Referencia Aludig</label><input id="e-ref" value="${esc(p.ref||'')}"/></div>
    <div class="field"><label>Cliente / Obra *</label><input id="e-client" value="${esc(p.client)}"/></div>
    <div class="field"><label>Descripción *</label><textarea id="e-desc">${esc(p.desc)}</textarea></div>
    <div class="field"><label>Observaciones</label><input id="e-obs" value="${esc(p.obs||'')}"/></div>
    <div class="field"><label>Etapa</label><select id="e-stage">${STAGES.map((s,i)=>`<option value="${i}" ${p.stage===i?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="field"><label>Fecha</label><input id="e-date" type="date" value="${p.date}"/></div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="updatePedido(${id})">Guardar</button></div>`);
}

function savePedido(){
  const c=document.getElementById('f-client').value.trim(),d=document.getElementById('f-desc').value.trim();
  if(!c||!d){toast('Completá cliente y descripción','error');return;}
  S.pedidos.push({id:S.nextId++,client:c,desc:d,ref:document.getElementById('f-ref').value.trim(),obs:document.getElementById('f-obs').value.trim(),stage:0,date:document.getElementById('f-date').value});
  saveState();closeModal();render();toast('✓ Pedido ingresado');
}

function updatePedido(id){
  const p=S.pedidos.find(x=>x.id===id);if(!p)return;
  p.client=document.getElementById('e-client').value.trim();p.desc=document.getElementById('e-desc').value.trim();
  p.ref=document.getElementById('e-ref').value.trim();p.obs=document.getElementById('e-obs').value.trim();
  p.stage=+document.getElementById('e-stage').value;p.date=document.getElementById('e-date').value;
  saveState();closeModal();render();toast('✓ Pedido actualizado');
}
