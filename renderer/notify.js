const q = new URLSearchParams(location.search);
document.getElementById('t').textContent = q.get('t') || 'Algooly';
document.getElementById('b').textContent = q.get('b') || '';
document.documentElement.style.setProperty('--ms', (parseInt(q.get('ms'), 10) || 3600) + 'ms');
const hit = document.getElementById('hit');
hit.addEventListener('mouseenter', () => { document.body.classList.add('hot'); if (window.notify) window.notify.hover(true); });
hit.addEventListener('mouseleave', () => { document.body.classList.remove('hot'); if (window.notify) window.notify.hover(false); });
hit.addEventListener('click', e => {
  if (!window.notify) return;
  if (e.target.closest('#x')) { document.body.classList.add('closing'); setTimeout(() => window.notify.close(), 230); return; }   // nút X: đóng, không mở app
  window.notify.click();
});
