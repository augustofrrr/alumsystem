// ================================================================
// TOAST
// ================================================================
let toastTimer;
function toast(msg,type){
  const el=document.getElementById('toast');
  el.textContent=msg;el.style.background=type==='error'?'var(--red-dark)':'#1a1a18';
  el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);
}
