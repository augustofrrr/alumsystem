// ================================================================
// INVENTARIO
// ================================================================
function openAddItem(cat,label){
  openModal(`
    <h3>Agregar material</h3><p class="modal-sub">${label}</p>
    <div class="field"><label>Nombre / Código *</label><input id="fi-name" placeholder="MT-0979 Marco puerta"/></div>
    <div class="field"><label>Unidad</label><select id="fi-unit"><option>barras</option><option>m²</option><option>u</option><option>rollos</option><option>kg</option><option>lts</option><option>pares</option></select></div>
    <div class="field-row">
      <div class="field"><label>Cantidad inicial</label><input id="fi-qty" type="number" value="0" min="0"/></div>
      <div class="field"><label>Stock mínimo</label><input id="fi-min" type="number" value="5" min="0"/></div>
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveItem('${cat}')">Guardar</button></div>`);
}

function saveItem(cat){
  const n=document.getElementById('fi-name').value.trim();if(!n){toast('Ingresá un nombre','error');return;}
  const mx=S.inv[cat].reduce((m,i)=>Math.max(m,i.id),0);
  S.inv[cat].push({id:mx+1,name:n,unit:document.getElementById('fi-unit').value,qty:+document.getElementById('fi-qty').value,min:+document.getElementById('fi-min').value});
  saveState();closeModal();render();toast('✓ Material agregado');
}

function updQty(cat,id,d){const it=S.inv[cat].find(i=>i.id===id);if(it){it.qty=Math.max(0,it.qty+d);saveState();render();}}
function delItem(cat,id){if(!confirm('¿Eliminar?'))return;S.inv[cat]=S.inv[cat].filter(i=>i.id!==id);saveState();render();toast('Material eliminado');}
