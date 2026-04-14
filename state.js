// ================================================================
// MODAL
// ================================================================
function openModal(html){document.getElementById('mc').innerHTML=`<div class="modal-bg" onclick="bgClose(event)"><div class="modal">${html}</div></div>`;}
function closeModal(){document.getElementById('mc').innerHTML='';}
function bgClose(e){if(e.target===e.currentTarget)closeModal();}
