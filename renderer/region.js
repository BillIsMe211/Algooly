const q = new URLSearchParams(location.search);
document.getElementById('ht').textContent = q.get('h') || '';
const body = document.body, bg = document.getElementById('bg'), sel = document.getElementById('sel'), sz = document.getElementById('sz');
let start = null, rect = null, finished = false;
window.region.onShot(buf => {
  const url = URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
  bg.style.backgroundImage = sel.style.backgroundImage = 'url(' + url + ')';
  body.classList.add('ready'); window.region.ready();
});
const norm = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });
function draw(r) {
  sel.classList.add('on'); sel.classList.toggle('low', r.y < 36);
  sel.style.left = r.x + 'px'; sel.style.top = r.y + 'px'; sel.style.width = r.w + 'px'; sel.style.height = r.h + 'px';
  sel.style.backgroundSize = innerWidth + 'px ' + innerHeight + 'px'; sel.style.backgroundPosition = (-r.x - 1.5) + 'px ' + (-r.y - 1.5) + 'px';
  const f = window.devicePixelRatio || 1; sz.textContent = Math.round(r.w * f) + ' × ' + Math.round(r.h * f);
}
addEventListener('pointerdown', e => { if (e.button !== 0 || finished) return; start = { x: e.clientX, y: e.clientY }; rect = null; body.classList.add('drag'); document.documentElement.setPointerCapture && 0; });
addEventListener('pointermove', e => { if (!start || finished) return; rect = norm(start, { x: e.clientX, y: e.clientY }); draw(rect); });
addEventListener('pointerup', e => {
  if (!start || finished) return; rect = norm(start, { x: e.clientX, y: e.clientY }); start = null;
  if (rect.w < 8 || rect.h < 8) { sel.classList.remove('on'); body.classList.remove('drag'); rect = null; return; }   // vùng quá nhỏ: chọn lại
  finished = true; draw(rect); body.classList.add('fire');
  setTimeout(() => window.region.done(rect), 130);
});
addEventListener('contextmenu', e => { e.preventDefault(); if (!finished) window.region.cancel(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !finished) { e.preventDefault(); window.region.cancel(); } });
