// ================================================================
// HELPERS
// ================================================================
function getLow(){const a=[];Object.values(S.inv).forEach(arr=>arr.forEach(i=>{if(i.qty<=i.min)a.push(i);}));return a;}
function formatDate(d){const[y,m,day]=d.split('-');return`${day}/${m}/${y}`;}
function formatARS(n){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0,maximumFractionDigits:0}).format(n);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fileToB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=()=>rej(new Error('Error al leer'));r.readAsDataURL(file);});}
