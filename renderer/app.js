(() => {
const api = window.api;
const D = api.data(), BASE = D.items;
const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (d, w = 13, extra = '') => `<svg width="${w}" height="${w}" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const IC = { hist:'<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2 4.5A1.5 1.5 0 013.5 3H7l1.5 1.8h5A1.5 1.5 0 0115 6.3v6.2a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 012 12.5z"/></svg>', lib:'<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="2" y="2.5" width="13" height="12" rx="2"/><path d="M8.5 2.5v12M5 6h1.5M5 9h1.5M10.5 6H12M10.5 9H12"/></svg>',
 bm:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M4 2.5h8v11l-4-2.8-4 2.8z"/></svg>',
 clock:'<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="6.2"/><path d="M8.5 5v3.8l2.4 1.4"/></svg>',
 ext:'<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3H3.5A1 1 0 002.5 4v7.5a1 1 0 001 1H11a1 1 0 001-1V9M8.5 2.5h4v4M12.5 2.5L7 8"/></svg>',
 cp: ic('<rect x="4" y="4" width="7.5" height="7.5" rx="1.5"/><path d="M9 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v5a1 1 0 001 1h1"/>'), check: ic('<path d="M2.5 6.8l2.6 2.6 5.4-5.8"/>'),
 expand: ic('<path d="M8 2h3v3M5 11H2V8M11 2L7.5 5.5M2 11l3.5-3.5"/>'), collapse: ic('<path d="M11 5H8V2M2 8h3v3M8 5l3.5-3.5M5 8l-3.5 3.5"/>'),
 undo: ic('<path d="M4.5 2.5L2 5l2.5 2.5M2 5h5.5a3 3 0 010 6H5"/>'), redo: ic('<path d="M8.5 2.5L11 5 8.5 7.5M11 5H5.5a3 3 0 000 6H8"/>'),
 cut: ic('<circle cx="3.5" cy="9.5" r="1.6"/><circle cx="9.5" cy="9.5" r="1.6"/><path d="M4.6 8.3L9.5 2M8.4 8.3L3.5 2"/>'), paste: ic('<rect x="2.5" y="3" width="8" height="8.5" rx="1.3"/><path d="M5 3V2h3v1"/>'),
 sel: ic('<rect x="2" y="2" width="9" height="9" rx="1" stroke-dasharray="2 1.6"/>'), plus: ic('<path d="M6.5 2.5v8M2.5 6.5h8"/>'), x:'<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>' };
const IS_MAC = /Mac/.test(navigator.userAgent);
// ---------- phím tắt tùy chỉnh (để trống = tắt)
const KEY_DEF = { new: 'Ctrl+N', newFolder: 'Ctrl+Shift+N', edit: 'Ctrl+E', viewLib: 'Ctrl+1', viewHist: 'Ctrl+2', find: 'Ctrl+K', settings: 'Ctrl+,', rename: 'F2', copy: 'Ctrl+C', cut: 'Ctrl+X', paste: 'Ctrl+V', del: 'Delete', esc: 'Escape' };
const keyOf = a => (S.keys && Object.prototype.hasOwnProperty.call(S.keys, a)) ? String(S.keys[a] || '') : (KEY_DEF[a] || '');
const PUNCT = { Comma: ',', Period: '.', Slash: '/', Backslash: '\\', Minus: '-', Equal: '=', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Backquote: '`' };
const NAMED = { ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', ' ': 'Space', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace', Delete: 'Delete', Escape: 'Escape', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown', Insert: 'Insert' };
function chordOf(e) {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null;
  const m = []; if (e.ctrlKey || e.metaKey) m.push('Ctrl'); if (e.altKey) m.push('Alt'); if (e.shiftKey) m.push('Shift');
  let k; if (/^Key[A-Z]$/.test(e.code)) k = e.code.slice(3); else if (/^Digit\d$/.test(e.code)) k = e.code.slice(5); else if (/^F\d{1,2}$/.test(e.key)) k = e.key;
  else k = PUNCT[e.code] || NAMED[e.key] || (e.key && e.key.length === 1 ? e.key.toUpperCase() : null);
  return k ? [...m, k].join('+') : null;
}
const isKey = (e, a) => { const k = keyOf(a); return !!k && chordOf(e) === k; };
const validChord = c => /\+/.test(c) || /^(F\d{1,2}|Delete)$/.test(c);
const fmtChord = c => c ? c.split('+').map(p => IS_MAC && p === 'Ctrl' ? 'Cmd' : p === 'Escape' ? 'Esc' : p).join(' + ') : '';
const keyLabel = a => fmtChord(keyOf(a)).replace(/ \+ /g, '+').replace('Delete', 'Del');
const CIC = (d, w = 17) => `<svg width="${w}" height="${w}" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const CAT_IC = {
  '': CIC('<rect x="2.5" y="2.5" width="4.6" height="4.6" rx="1.2"/><rect x="9.9" y="2.5" width="4.6" height="4.6" rx="1.2"/><rect x="2.5" y="9.9" width="4.6" height="4.6" rx="1.2"/><rect x="9.9" y="9.9" width="4.6" height="4.6" rx="1.2"/>'),
  basic: CIC('<circle cx="7.5" cy="7.5" r="4.6"/><path d="M11 11l3.6 3.6"/>'),
  ds: CIC('<ellipse cx="8.5" cy="4.2" rx="5.2" ry="2.1"/><path d="M3.3 4.2v8.6c0 1.2 2.3 2.1 5.2 2.1s5.2-.9 5.2-2.1V4.2M3.3 8.5c0 1.2 2.3 2.1 5.2 2.1s5.2-.9 5.2-2.1"/>'),
  graph: CIC('<circle cx="4" cy="4.5" r="1.7"/><circle cx="13" cy="4.5" r="1.7"/><circle cx="8.5" cy="13" r="1.7"/><path d="M5.6 5.3l2 6.2M11.4 5.3l-2 6.2M5.8 4.5h5.4"/>'),
  dp: CIC('<path d="M2.5 14.5h12M4 14.5V10h3v4.5M7 14.5V6.5h3v8M10 14.5V3h3v11.5"/>'),
  math: CIC('<path d="M6.5 2.5L5 14.5M12 2.5l-1.5 12M3 6.2h11.5M2.5 10.8H14"/>'),
  string: CIC('<path d="M2.5 5V3.5h12V5M8.5 3.5v10M6 13.5h5"/>'),
  geo: CIC('<path d="M8.5 2.5l6 11h-12z"/>')
};
const PRESETS = { sunset:'linear-gradient(135deg,#f6a56b,#e0607e 55%,#5b4a9e)', ocean:'linear-gradient(135deg,#69c3d8,#3a7bd5 55%,#1d2f6f)', forest:'linear-gradient(135deg,#a8d5a2,#4f9a7a 55%,#1f4a4f)', dusk:'linear-gradient(135deg,#8e9eab,#5a5f8f 55%,#232a4a)' };
const DEF = { lang:'vi', theme:'light', bgUrl:'', preset:'', overlay:.45, blur:0, panel:.78, tint:'', saved:[], recent:[], codeLang:'cpp', keys:{}, edit:false, ov:{}, custom:[], del:[], historyLayout:'cards', historyOrder:[] };
let S = Object.assign({}, DEF);
try { Object.assign(S, JSON.parse(localStorage.getItem('algosearch') || '{}')); } catch (e) {}
S.ov = S.ov || {}; S.custom = S.custom || []; S.del = S.del || []; if (!S.keys || typeof S.keys !== 'object') S.keys = {};
if (S.historyLayout !== 'tree' && S.historyLayout !== 'list') S.historyLayout = 'cards';
if (!Array.isArray(S.historyOrder)) S.historyOrder = [];
let persistT; const persist = () => { clearTimeout(persistT); persistT = setTimeout(() => { try { localStorage.setItem('algosearch', JSON.stringify(S)); } catch (e) {} }, 120); };
const persistNow = () => { clearTimeout(persistT); try { localStorage.setItem('algosearch', JSON.stringify(S)); } catch (e) {} };
let st = { full: false, view: 'lib', cat: '', level: 0, q: '', sort: 'rel', sel: '', tab: 'ov', showOrig: false };
const T = () => I18N[S.lang] || I18N.vi, catName = c => (CATS[c] || {})[S.lang] || c, levelName = l => T()['l' + l];
const tx = m => (m && (m[S.lang] || m.en || m.vi || Object.values(m).find(Boolean))) || '';
const title = it => tx(it.names) || '(…)';

// ---------- dữ liệu hiệu lực (gốc + chỉnh sửa)
let CACHE = null; const inval = () => { CACHE = null; };
function eff(it) { const o = S.ov[it.id]; if (!o) return it; const r = Object.assign({}, it, o); r.names = Object.assign({}, it.names, o.names); r.sum = Object.assign({}, it.sum, o.sum); r.steps = Object.assign({}, it.steps, o.steps); r.codes = Object.assign({}, it.codes, o.codes); return r; }
function items() { return CACHE || (CACHE = [...BASE.filter(i => !S.del.includes(i.id)), ...S.custom].map(eff)); }
const byId = id => items().find(i => i.id === id);
function upd(id, fn) { const c = S.custom.find(i => i.id === id); if (c) fn(c); else fn(S.ov[id] = S.ov[id] || {}); inval(); persist(); }
const codesOf = (it, cl) => (it.codes && it.codes[cl]) || [];
const isEdited = (it, cl) => !it.custom && !!(S.ov[it.id] && S.ov[it.id].codes && S.ov[it.id].codes[cl]);
function editCodes(it, cl, fn) { const arr = codesOf(byId(it.id) || it, cl).map(c => ({ name: c.name, code: c.code })); fn(arr); upd(it.id, o => { o.codes = Object.assign({}, o.codes, { [cl]: arr }); }); }
const stepsOf = it => (it.steps && (it.steps[S.lang] || it.steps.en || it.steps.vi)) || [];
const domain = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };

// ---------- giao diện / nền
function hexRgb(h) { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',') : ''; }
function applyLook() {
  const r = document.documentElement, hasBg = !!(S.bgUrl || S.preset);
  r.dataset.theme = S.theme; document.body.classList.toggle('has-bg', hasBg);
  r.style.setProperty('--ov-a', hasBg ? S.overlay : 0); r.style.setProperty('--bg-blur', S.blur + 'px'); { const bgEl = $('#bg'); if (bgEl) bgEl.style.filter = S.blur > 0 ? '' : 'none'; } r.style.setProperty('--panel-a', hasBg ? S.panel : 1); r.style.setProperty('--pblur', hasBg ? '10px' : '0px');
  const tc = hexRgb(S.tint); if (tc) r.style.setProperty('--ov-color', tc); else r.style.removeProperty('--ov-color');
  $('#bg').style.backgroundImage = S.bgUrl ? `url("${S.bgUrl}")` : (PRESETS[S.preset] || 'none'); r.lang = S.lang;
  const eb = $('#editbar'); eb.hidden = !S.edit; if (S.edit) { $('#ebT').textContent = T().editBanner; $('#ebS').textContent = T().editBannerSub; $('#ebExit').textContent = T().exitEdit; }
}
// ---------- tìm kiếm
function normQ(q) { q = q.toLowerCase().trim(); for (const k of Object.keys(ALIAS)) if (q.includes(k)) q = q.split(k).join(' ' + ALIAS[k] + ' '); return q.split(/\s+/).filter(Boolean); }
function score(it, toks) {
  const names = Object.values(it.names || {}).join(' ').toLowerCase(), id = it.id.toLowerCase(), cat = Object.values(CATS[it.cat] || {}).join(' ').toLowerCase(), sm = Object.values(it.sum || {}).join(' ').toLowerCase(), stp = Object.values(it.steps || {}).flat().join(' ').toLowerCase(), tx2 = (it.text || '').toLowerCase();
  let tot = 0;
  for (const k of toks) { let s = 0;
    if (names.includes(k)) s += 100 + (names.startsWith(k) ? 40 : 0); if (id.includes(k)) s += 50; if (cat.includes(k)) s += 20; if (sm.includes(k)) s += 15; if (stp.includes(k)) s += 10;
    if (!s) { const i = tx2.indexOf(k); if (i < 0) return 0; s = 4 + Math.min(10, tx2.split(k).length - 1); }
    tot += s; }
  return tot;
}
function filtered() {
  let pool = items();
  if (st.view === 'saved') pool = S.saved.map(byId).filter(Boolean);
  if (st.cat) pool = pool.filter(i => i.cat === st.cat); if (st.level) pool = pool.filter(i => i.level === st.level);
  const toks = normQ(st.q), az = (a, b) => title(a).localeCompare(title(b), S.lang);
  if (toks.length) { const sc = pool.map(i => [i, score(i, toks)]).filter(x => x[1] > 0); if (st.sort === 'az') sc.sort((a, b) => az(a[0], b[0])); else sc.sort((a, b) => b[1] - a[1]); return sc.map(x => x[0]); }
  return st.sort === 'az' ? [...pool].sort(az) : pool;
}
// ---------- khung chung
const opt = (v, cur, lab) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`;
function renderChrome() {
  const t = T(), all = items();
  $('#topicsLabel').textContent = t.topics; $('#setLabel').textContent = t.settings;
  const hm = st.view === 'history'; $('#main').classList.toggle('hist-mode', hm); $('#hTitle').textContent = hm ? t.histTitle : t.title; $('#q').placeholder = t.ph;
  $('#stCount').textContent = t.inLib(all.length); renderNetworkStatus();
  $('#views').innerHTML = [['lib', IC.lib, t.library, all.length], ['saved', IC.bm, t.saved, S.saved.filter(byId).length], ['history', IC.hist, t.history, window.History ? History.count() : 0]].map(v => `<button class="nv ${st.view === v[0] && (v[0] !== 'lib' || !st.cat) ? 'on' : ''}" data-view="${v[0]}" data-tip="${esc(v[2])}" data-tipn="${v[3]}" aria-label="${esc(v[2])}">${v[1]}<span>${esc(v[2])}</span><span class="n">${v[3]}</span></button>`).join('');
  const cnt = {}; all.forEach(i => cnt[i.cat] = (cnt[i.cat] || 0) + 1);
  $('#topics').innerHTML = `<button class="nv" data-cat="" data-tip="${esc(t.allAlgos)}" data-tipn="${all.length}" aria-label="${esc(t.allAlgos)}">${CAT_IC['']}<span>${esc(t.allAlgos)}</span><span class="n">${all.length}</span></button>` + CAT_ORDER.map(c => `<button class="nv ${st.view === 'lib' && st.cat === c ? 'on' : ''}" data-cat="${c}" data-tip="${esc(catName(c))}" data-tipn="${cnt[c] || 0}" aria-label="${esc(catName(c))}">${CAT_IC[c] || CAT_IC['']}<span>${esc(catName(c))}</span><span class="n">${cnt[c] || 0}</span></button>`).join('');
  const sb = $('#openSettings'); sb.dataset.tip = t.settings; sb.setAttribute('aria-label', t.settings); const kb = $('#searchbox kbd'); if (kb) { kb.textContent = fmtChord(keyOf('find')); kb.hidden = !keyOf('find'); }
  $('#filters').innerHTML = `<span class="flab">${esc(t.filter)}</span>` + (st.cat ? `<span class="chip">${esc(catName(st.cat))}<button data-cat="" aria-label="remove">${IC.x}</button></span>` : '') +
   `<span class="sel"><select id="fLevel">${opt(0, st.level, t.level + ': ' + t.all)}${[1, 2, 3].map(l => opt(l, st.level, t.level + ': ' + levelName(l))).join('')}</select></span><button class="link" id="fClear">${esc(t.clear)}</button>`;
  $('#sort').innerHTML = opt('rel', st.sort, t.rel) + opt('az', st.sort, t.az); $('#sortWrap').className = 'sel';
  const ab = $('#addAlgo'); ab.hidden = !S.edit; ab.innerHTML = IC.plus + ' ' + esc(t.addAlgo);
}
function renderNetworkStatus() {
  const online = navigator.onLine && window.systemNetworkOnline !== false, status = $('#networkStatus');
  status.classList.toggle('online', online); status.classList.toggle('offline', !online);
  $('#networkLabel').textContent = online ? T().online : T().offline; status.dataset.tip = $('#networkLabel').textContent;
}
window.addEventListener('online', () => { window.browserNetworkOnline = true; renderNetworkStatus(); });
window.addEventListener('offline', () => { window.browserNetworkOnline = false; renderNetworkStatus(); });
api.on('network-status', online => { window.systemNetworkOnline = !!online; renderNetworkStatus(); });
api.inv('network-status').then(online => { window.systemNetworkOnline = !!online; renderNetworkStatus(); });
// ---------- hiệu ứng chuyển cảnh
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function animIn(el, cls = 'enter') { if (!el || reduceMotion()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function animTabBody() { const d = $('#detail'); if (d) d.querySelectorAll('.tabs ~ *').forEach(n => animIn(n)); }
// modal / toast / cfull: mờ dần + thu nhỏ nhẹ khi đóng thay vì tắt đột ngột
function softHide(el, ms = 150) {
  const base = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidden'); let timer = 0;
  Object.defineProperty(el, 'hidden', { configurable: true,
    get() { return base.get.call(this) || this.classList.contains('closing'); },
    set(v) {
      v = !!v; clearTimeout(timer);
      if (v && !base.get.call(this) && !reduceMotion()) { this.classList.add('closing'); timer = setTimeout(() => { this.classList.remove('closing'); base.set.call(this, true); }, ms); }
      else { this.classList.remove('closing'); base.set.call(this, v); }
    } });
}
['#modal', '#cfull', '#warnModal', '#toast'].forEach(sel => { const e = $(sel); if (e) softHide(e); });

// ---------- thanh bên: mở rộng / thu gọn
const appEl = $('#app'); appEl.classList.add('side-collapsed');          // sidebar luôn ở dạng icon gọn để dành chỗ cho code
// tooltip: chỉ hiện khi sidebar đang thu gọn (riêng nút đóng/mở luôn hiện)
const tipEl = $('#tip'); let tipTimer = 0, tipHide = 0, tipFor = null;
function showTip(el) {
  const txt = el.dataset.tip; if (!txt) return;
  const n = el.dataset.tipn; clearTimeout(tipHide);
  tipEl.innerHTML = `<span>${esc(txt)}</span>` + (n !== undefined && n !== '' ? `<em>${esc(n)}</em>` : ''); tipEl.hidden = false; tipEl.classList.remove('show');
  const r = el.getBoundingClientRect(), tw = tipEl.offsetWidth, th = tipEl.offsetHeight, below = false;
  let x = below ? r.left : r.right + 10, y = below ? r.bottom + 8 : r.top + r.height / 2 - th / 2;
  tipEl.classList.toggle('below', below);
  x = Math.max(8, Math.min(x, window.innerWidth - tw - 8)); y = Math.max(8, Math.min(y, window.innerHeight - th - 8));
  tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px'; tipEl.classList.add('show'); tipFor = el;
}
function hideTip(now) {
  clearTimeout(tipTimer); tipFor = null; tipEl.classList.remove('show'); clearTimeout(tipHide);
  if (now) tipEl.hidden = true; else tipHide = setTimeout(() => { if (!tipEl.classList.contains('show')) tipEl.hidden = true; }, 140);
}
document.addEventListener('mouseover', e => {
  const el = e.target.closest && e.target.closest('[data-tip]'); if (!el || el === tipFor) return;
  clearTimeout(tipTimer); tipTimer = setTimeout(() => showTip(el), 110);
});
document.addEventListener('mouseout', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) hideTip(); });
document.addEventListener('mousedown', () => hideTip(true), true);
window.addEventListener('blur', () => hideTip(true));
{ const tb = $('#titlebar'), setMax = v => tb.classList.toggle('is-max', !!v);
  api.on('maxstate', setMax); api.inv('win-ismax').then(setMax).catch(() => {});
  api.on('pop', () => animIn(appEl, 'popin')); api.on('goto', v => { if (v === 'history') { if (!$('#modal').hidden) $('#modal').hidden = true; setView('history'); } }); }
appEl.classList.add('boot'); requestAnimationFrame(() => requestAnimationFrame(() => appEl.classList.remove('boot')));
function card(it) {
  const on = it.id === st.sel, sv = S.saved.includes(it.id);
  return `<div class="card ${on ? 'on' : ''}" data-id="${esc(it.id)}" tabindex="0" role="button"><button class="bm ${sv ? 'on' : ''}" data-bm="${esc(it.id)}" aria-label="save">${IC.bm}</button>
  <h3>${esc(title(it))}</h3><div class="sub">${esc(catName(it.cat))}</div><div class="sm">${esc(tx(it.sum))}</div>
  <div class="meta"><span class="tag t${it.level}">${esc(levelName(it.level))}</span>${it.custom ? `<span class="tag cu">${esc(T().custom)}</span>` : ''}${on ? `<span class="v">${esc(T().viewing)}</span>` : ''}</div></div>`;
}
let LIST = [];
function renderList(keep) {
  LIST = filtered(); const t = T(), sc = $('#cards').scrollTop; $('#count').textContent = t.results(LIST.length);
  const noItems = st.view === 'lib' && !st.q && !st.cat && !st.level && !items().length;
  const empty = `<div class="empty">${esc(st.view === 'saved' && !st.q ? t.emptySaved : noItems ? t.emptyLib : t.none)}</div>`;
  $('#cards').innerHTML = !LIST.length ? empty : LIST.map(card).join('');
  $('#cards').scrollTop = keep ? sc : 0;
}
const stableJson = value => Array.isArray(value) ? `[${value.map(stableJson).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`).join(',')}}` : JSON.stringify(value);
function validateLibraryItem(item) {
  const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
  if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string' || !item.id || item.id.length > 240 ||
      !record(item.names) ||
      !CAT_ORDER.includes(item.cat) || !Number.isInteger(item.level) || item.level < 1 || item.level > 3) return false;
  const safe = value => {
    if (!value || typeof value !== 'object') return true;
    for (const key of Object.keys(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key) || !safe(value[key])) return false;
    }
    return true;
  };
  const textMap = value => value == null || (record(value) && Object.values(value).every(v => typeof v === 'string'));
  const stepsMap = value => value == null || (record(value) && Object.values(value).every(v => Array.isArray(v) && v.every(line => typeof line === 'string')));
  const codesMap = value => value == null || (record(value) && Object.values(value).every(list => Array.isArray(list) && list.every(code => record(code) && typeof code.name === 'string' && typeof code.code === 'string')));
  const safeUrl = value => typeof value === 'string' && (!value || /^https?:\/\//i.test(value));
  const links = value => value == null || (Array.isArray(value) && value.every(link => record(link) && typeof link.n === 'string' && safeUrl(link.u)));
  const practice = value => value == null || (Array.isArray(value) && value.every(problem => record(problem) && typeof problem.t === 'string' && (problem.u == null || safeUrl(problem.u))));
  return safe(item) && Object.values(item.names).every(v => typeof v === 'string') &&
    textMap(item.sum) && stepsMap(item.steps) && codesMap(item.codes) && links(item.links) && practice(item.practice) &&
    (item.md == null || typeof item.md === 'string') && (item.text == null || typeof item.text === 'string') &&
    (item.mem == null || typeof item.mem === 'string');
}
async function exportLibrary() {
  const payload = { app: 'Algooly', format: 1, items: items().map(it => JSON.parse(JSON.stringify(it))) };
  const result = await api.inv('lib-export-zip', payload);
  if (result && result.error) return toast(result.error);
  if (!result || result.canceled) return;
  toast(T().libExported(result.count));
}
async function importLibrary(channel = 'lib-import-zip') {
  const result = await api.inv(channel);
  if (!result || result.canceled) return;
  if (result.error) return toast(result.error);
  if (!Array.isArray(result.items) || result.items.some(it => !validateLibraryItem(it)) || new Set(result.items.map(it => it.id)).size !== result.items.length) return toast(T().libZipBad || 'Invalid library data');
  const current = items(), added = [];
  result.items.forEach((item, index) => {
    if (S.custom.some(existing => existing.importSourceId === item.id)) return;
    const sameId = current.find(existing => existing.id === item.id);
    if (sameId && stableJson(sameId) === stableJson(item)) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = `custom:import:${Date.now()}:${index}`; copy.custom = true; copy.importSourceId = item.id;
    added.push(copy);
  });
  if (!added.length) return toast(T().libImportNone);
  S.custom.push(...added); persistNow(); inval(); fullRefresh(); toast(T().libImported(added.length));
}
// ---------- Markdown bài gốc
function renderMd(md) {
  const maths = []; const hold = (tex, disp) => { maths.push([tex, disp]); return `@@M${maths.length - 1}@@`; };
  md = md.split(/(```[\s\S]*?```|`[^`\n]+`)/g).map((p, i) => i % 2 ? p : p.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => hold(m, true)).replace(/\$((?:\\.|[^$\\\n])+?)\$/g, (_, m) => hold(m, false))).join('');
  let html = marked.parse(md, { gfm: true });
  return html.replace(/@@M(\d+)@@/g, (_, n) => { const [tex, d] = maths[+n]; try { return katex.renderToString(tex, { displayMode: d, throwOnError: true, strict: 'ignore' }); } catch (e) { return `<code>${esc(tex)}</code>`; } });
}
const hl = (code, lang) => { try { return hljs.highlight(code, { language: lang === 'py' ? 'python' : 'cpp', ignoreIllegals: true }).value; } catch (e) { return esc(code); } };
const gutterTimers = new WeakMap();
function lineCount(text) { let count = 1; for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) count++; return count; }
function lineNumbers(count) { let lines = '1'; for (let i = 2; i <= count; i++) lines += '\n' + i; return lines; }
function refreshGutterSoon(ta, gutter) {
  clearTimeout(gutterTimers.get(ta));
  gutterTimers.set(ta, setTimeout(() => { gutter.textContent = lineNumbers(lineCount(ta.value)); }, 50));
}
function indentEditor(ta, e) {
  e.preventDefault();
  const value = ta.value, start = ta.selectionStart, end = ta.selectionEnd;
  if (start === end) {
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1, match = value.slice(lineStart).match(/^ {1,4}/), remove = match ? match[0].length : 0;
      if (remove) ta.setRangeText('', lineStart, lineStart + remove, 'end');
      else return;
    } else ta.setRangeText('    ', start, end, 'end');
  } else {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lastSelected = Math.max(start, end - 1), newline = value.indexOf('\n', lastSelected);
    const lineEnd = newline < 0 ? value.length : newline;
    const block = value.slice(lineStart, lineEnd), lines = block.split('\n');
    let next;
    if (e.shiftKey) next = lines.map(line => line.replace(/^ {1,4}/, '')).join('\n');
    else next = lines.map(line => '    ' + line).join('\n');
    ta.setRangeText(next, lineStart, lineEnd, 'select');
  }
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}
const AC = {};
function articleHtml(it) {
  if (AC[it.id]) return AC[it.id];
  const box = document.createElement('div'); box.className = 'article'; box.innerHTML = renderMd(it.md || '');
  const dir = it.id.includes('/') ? it.id.slice(0, it.id.lastIndexOf('/') + 1) : '';
  box.querySelectorAll('img').forEach(im => { const s = im.getAttribute('src') || ''; if (!/^(https?:|data:|file:)/.test(s)) im.src = '../content/' + dir + s; im.loading = 'lazy'; });
  box.querySelectorAll('a').forEach(a => { const h = a.getAttribute('href') || '';
    if (/^https?:/i.test(h)) { a.dataset.ext = h; a.removeAttribute('href'); a.style.cursor = 'pointer'; }
    else if (/\.md(#.*)?$/.test(h)) { const o = []; for (const s of (dir + h.replace(/#.*$/, '').replace(/\.md$/, '')).split('/')) { if (s === '..') o.pop(); else if (s !== '.' && s) o.push(s); } const id = o.join('/'); if (byId(id)) a.dataset.nav = id; a.removeAttribute('href'); a.style.cursor = 'pointer'; } else a.removeAttribute('href'); });
  box.querySelectorAll('pre > code').forEach(c => { const raw = c.textContent.replace(/\n$/, ''), isCpp = /language-cpp/.test(c.className), w = document.createElement('div');
    w.innerHTML = isCpp ? `<div class="code" data-art><div class="bar"><span class="bl"><b>C++</b></span></div><div class="body"><div class="snip"><div class="sbody"><div class="gut">${Array.from({ length: raw.split('\n').length }, (_, i) => i + 1).join('\n')}</div><pre><code>${hl(raw, 'cpp')}</code></pre></div></div></div></div>` : `<pre style="background:var(--stat);padding:10px 14px;border-radius:8px;overflow:auto;font:12px/1.6 var(--mono)">${esc(raw)}</pre>`;
    c.parentElement.replaceWith(w.firstElementChild); });
  return AC[it.id] = box.outerHTML;
}
// ---------- hộp code
function codeBox(it, full) {
  const t = T(), cl = S.codeLang, cs = codesOf(it, cl), n = cs.length, ed = S.edit, ext = cl === 'py' ? 'py' : 'cpp';
  const name = n === 1 ? cs[0].name : n ? `${n} × .${ext}` : '';
  const seg = `<span class="seg2"><button data-cl="cpp" class="${cl === 'cpp' ? 'on' : ''}">C++</button><button data-cl="py" class="${cl === 'py' ? 'on' : ''}">Python</button></span>`;
  const acts = full ? `<button class="cb" data-collapse>${IC.collapse}<span>${esc(t.collapse)}</span></button>` : `<button class="cb" data-expand>${IC.expand}<span>${esc(t.expand)}</span></button>`;
  const tools = ed ? `<div class="tools"><button class="cb" data-act="undo">${IC.undo}<span>${esc(t.undo)}</span></button><button class="cb" data-act="redo">${IC.redo}<span>${esc(t.redo)}</span></button><span class="sep"></span><button class="cb" data-act="cut">${IC.cut}<span>${esc(t.cut)}</span></button><button class="cb" data-act="all">${IC.sel}<span>${esc(t.selAll)}</span></button><span class="sep"></span><button class="cb pri" data-addsnip>${IC.plus}<span>${esc(t.addSnippet)}</span></button></div>` : '';
  const snips = cs.map((c, i) => { const g = lineNumbers(lineCount(c.code));
    const head = ed ? `<div class="snh ed"><input data-snname="${i}" value="${esc(c.name)}" placeholder="${esc(t.snippetName)}" spellcheck="false"><button class="cb del" data-delsnip="${i}">${IC.x}<span>${esc(t.delSnippet)}</span></button></div>` : (n > 1 ? `<div class="snh">${esc(c.name)}</div>` : '');
    const body = ed ? `<textarea class="ta" data-i="${i}" spellcheck="false" wrap="off" autocomplete="off">${esc(c.code)}</textarea>` : `<pre><code>${hl(c.code, cl)}</code></pre>`;
    return `<div class="snip">${head}<div class="sbody"><div class="gut">${g}</div>${body}</div></div>`; }).join('') || `<div class="snh" style="padding:18px 16px">${esc(t.noCode)}</div>`;
  return `<div class="code ${ed ? 'editing' : ''} ${full ? 'full' : ''}" data-ov><div class="bar"><span class="bl">${seg}<i>${esc(name)}</i>${isEdited(it, cl) ? `<em class="badge ${ed ? 'ed' : ''}">${esc(t.edited)}</em>` : ''}</span><span class="acts">${acts}</span></div>${tools}<div class="body">${snips}</div></div>`;
}
function renderFull() { const it = byId(st.sel); if (!it) return closeFull(); $('#cfull .cfbox').innerHTML = codeBox(it, true); $('#cfull').hidden = false; }
function closeFull() { st.full = false; const c = $('#cfull'); if (c) c.hidden = true; }
function refreshCode() { renderDetail(); }
// ---------- nguồn tài liệu
function buildLinks(it) {
  if (it.links) return it.links; const lk = it.lk || {}, L = [], en = (it.names && it.names.en) || title(it);
  if (it.url) L.push({ k: 'read', n: 'CP-Algorithms', u: it.url }); if (lk.w) L.push({ k: 'read', n: 'Wikipedia', u: 'https://en.wikipedia.org/wiki/' + lk.w }); if (lk.u) L.push({ k: 'read', n: 'USACO Guide', u: 'https://usaco.guide/' + lk.u });
  if (lk.v) L.push({ k: 'visual', n: 'VisuAlgo', u: 'https://visualgo.net/en/' + lk.v }); if (lk.a) L.push({ k: 'lib', n: 'AtCoder Library', u: 'https://atcoder.github.io/ac-library/master/document_en/' + lk.a + '.html' });
  if (lk.e) L.push({ k: 'course', n: 'Codeforces EDU', u: 'https://codeforces.com/edu/course/' + lk.e });
  if (!it.custom) L.push({ k: 'video', n: 'YouTube', u: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(en + ' algorithm competitive programming') });
  return L;
}
function sourcesHtml(it) {
  const t = T(), L = buildLinks(it), ed = S.edit, groups = ['read', 'visual', 'lib', 'course', 'video', 'other'];
  const body = groups.map(g => { const xs = L.map((x, i) => [x, i]).filter(([x]) => (x.k || 'other') === g); if (!xs.length) return '';
    return `<h5>${esc(t['g_' + g] || g)}</h5><ul>${xs.map(([x, i]) => `<li><a data-ext="${esc(x.u)}" href="#">${IC.ext}<span>${esc(x.n)}<small>${esc(domain(x.u))}</small></span></a>${ed ? `<button class="xdel" data-dellink="${i}" aria-label="delete">×</button>` : ''}</li>`).join('')}</ul>`; }).join('');
  const add = ed ? `<div class="addrow"><input id="lkN" placeholder="${esc(t.pTitle)}"><input id="lkU" placeholder="${esc(t.pUrl)}"><button class="btn pri" data-addlink>${esc(t.addLink)}</button></div>` : '';
  return `<div class="srcs"><h4>${esc(t.others)}</h4>${body}${add}</div>`;
}
// ---------- chi tiết
function editPanel(it) {
  const t = T();
  return `<div class="editpanel"><label>${esc(t.fTitle)}<input data-f="name" value="${esc(tx(it.names))}"></label><label>${esc(t.fCat)}<select data-f="cat">${CAT_ORDER.map(c => opt(c, it.cat, catName(c))).join('')}</select></label>
  <label class="wide">${esc(t.fSummary)}<textarea data-f="sum">${esc(tx(it.sum))}</textarea></label>
  <label>${esc(t.fMem)}<input data-f="mem" value="${esc(it.mem)}"></label>
  <label>${esc(t.level)}<select data-f="level">${[1, 2, 3].map(l => opt(l, it.level, levelName(l))).join('')}</select></label></div>`;
}
function renderDetail() {
  const it = byId(st.sel), el = $('#detail'), t = T(), ed = S.edit;
  el.classList.toggle('blank', !it);
  if (!it) { el.innerHTML = `<div class="hello"><div class="hlogo">${$('.brand .logo').innerHTML}</div><h2>Hello! <b>Algorithmers</b></h2><p>${t.pickHint}</p></div>`; return; }
  const sv = S.saved.includes(it.id); let body = '';
  if (st.tab === 'ov') { const blocks = { info: `<p class="lead">${esc(tx(it.sum))}</p><div class="stats"><div class="stat"><small>${t.mem}</small><b>${esc(it.mem || '—')}</b></div><div class="stat"><small>${t.diff}</small><b class="l${it.level}">${esc(levelName(it.level))}</b></div></div>`, code: `<div class="ch"><b>${esc(t.refImpl)}</b></div>` + codeBox(it, false), sources: sourcesHtml(it) };
    body = (ed ? editPanel(it) : '') + blockOrder().map(k => `<div class="blk" data-blk="${k}"><span class="grip" draggable="true" data-grip="${k}" title="${esc(t.dragHint)}"><svg width="26" height="8" viewBox="0 0 26 8" fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="15" cy="4" r="1.6"/><circle cx="21" cy="4" r="1.6"/></svg></span>${blocks[k]}</div>`).join(''); }
  else {
    const P = it.practice || [];
    body = `<ul class="plist">${P.length ? P.map((p, i) => `<li>${p.u ? `<a data-ext="${esc(p.u)}" href="#">${esc(p.t)}<span class="dom">${esc(domain(p.u))}</span></a>` : `<span>${esc(p.t)}</span>`}${ed ? `<button class="xdel" data-delprob="${i}" aria-label="delete">×</button>` : ''}</li>`).join('') : `<li class="note">${esc(t.practiceEmpty)}</li>`}</ul>` +
      (ed ? `<div class="addrow"><input id="prN" placeholder="${esc(t.pTitle)}"><input id="prU" placeholder="${esc(t.pUrl)}"><button class="btn pri" data-addprob>${esc(t.addProblem)}</button></div>` : '');
  }
  el.innerHTML = `<div class="dh"><div><h2>${esc(title(it))}</h2><div class="ds">${esc(catName(it.cat))}</div></div><div class="row">${ed ? `<button class="btn warn" data-delalgo>${esc(t.delAlgo)}</button>` : ''}<button class="savebtn ${sv ? 'on' : ''}" data-bm="${esc(it.id)}">${IC.bm}<span>${esc(sv ? t.savedBtn : t.save)}</span></button><button class="xclose" data-closedetail title="${esc(t.closePanel)}" aria-label="close">${IC.x}</button></div></div>
  <div class="tabs">${[['ov', t.tOverview], ['pr', t.tPractice]].map(x => `<button class="tab ${st.tab === x[0] ? 'on' : ''}" data-tab="${x[0]}">${esc(x[1])}</button>`).join('')}</div>${body}${st.tab === 'ov' ? '' : sourcesHtml(it)}`;
  if (st.full) renderFull();
}
const blockOrder = () => { const d = ['info', 'code', 'sources'], o = (S.order || []).filter(k => d.includes(k)); d.forEach(k => { if (!o.includes(k)) o.push(k); }); return o; };
function closeDetail() { closeFull(); st.sel = ''; renderList(true); renderDetail(); }
function select(id, opts = {}) {
  if (!byId(id)) return; const chg = st.sel !== id; if (chg) { closeFull(); $('#detail').scrollTop = 0; } st.sel = id; if (opts.tab) st.tab = opts.tab;
  renderList(true); renderDetail(); renderChrome(); if (chg) animIn($('#detail'));
  const c = $(`.card[data-id="${CSS.escape(id)}"], .lib-tree-item[data-id="${CSS.escape(id)}"]`); if (c) c.scrollIntoView({ block: 'nearest' });
}
function closeMenu() { const m = document.querySelector('.ctx:not(.out)'); if (!m) return; if (reduceMotion()) return m.remove(); m.classList.add('out'); setTimeout(() => m.remove(), 110); }
function menu(x, y, its) {
  closeMenu(); const el = document.createElement('div'); el.className = 'ctx';
  el.innerHTML = its.map((it, i) => it.sep ? '<div class="sep"></div>' : `<button class="ci ${it.danger ? 'danger' : ''}" data-ci="${i}" ${it.off ? 'disabled' : ''}><span>${esc(it.label)}</span>${it.keys ? `<kbd>${esc(it.keys)}</kbd>` : ''}</button>`).join('');
  const margin = 6, viewportWidth = innerWidth, viewportHeight = innerHeight;
  el.style.maxWidth = `${Math.max(0, viewportWidth - margin * 2)}px`;
  el.style.maxHeight = `${Math.max(0, viewportHeight - margin * 2)}px`;
  el.style.overflowY = 'auto'; el.style.overflowX = 'hidden';
  document.body.appendChild(el);
  const width = el.offsetWidth, height = el.offsetHeight;
  const left = x + width > viewportWidth - margin ? x - width : x;
  const top = y + height > viewportHeight - margin ? y - height : y;
  el.style.left = `${Math.max(margin, Math.min(left, viewportWidth - width - margin))}px`;
  el.style.top = `${Math.max(margin, Math.min(top, viewportHeight - height - margin))}px`;
  el.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if (!b) return; const it = its[+b.dataset.ci]; closeMenu(); if (it.run) it.run(); });
}
function ask(title, val = '', ph = '') {
  return new Promise(res => { const w = document.createElement('div'); w.className = 'askwrap';
    w.innerHTML = `<div class="mask"></div><div class="dlg askd"><h2>${esc(title)}</h2><input id="askIn" value="${esc(val)}" placeholder="${esc(ph)}" spellcheck="false"><div class="dlgf"><button class="btn" data-a="0">${esc(T().cancel)}</button><button class="btn pri" data-a="1">${esc(T().ok)}</button></div></div>`;
    document.body.appendChild(w); const inp = w.querySelector('input'); inp.focus(); inp.select(); const done = v => { w.remove(); res(v); };
    w.addEventListener('click', e => { if (e.target.classList.contains('mask')) return done(null); const b = e.target.closest('[data-a]'); if (b) done(b.dataset.a === '1' ? inp.value.trim() : null); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(inp.value.trim()); } if (e.key === 'Escape') { e.stopPropagation(); done(null); } }); });
}
function showHistoryHelp() {
  const t = T(); $('#modal').hidden = false;
  $('#dlgBody').innerHTML = `<h2>${esc(t.histHelpTitle)}</h2><p class="hint">${esc(t.histHelpBody)}</p><ul class="history-help-list"><li>${esc(t.histHelpCapture)}</li><li>${esc(t.histHelpCode)}</li><li>${esc(t.histHelpAuto)}</li></ul><div class="dlgf"><span></span><button class="btn pri" id="closeDlg">${esc(t.close)}</button></div>`;
}
function setView(v) { st.view = v; st.cat = ''; $('#main').classList.toggle('hist-mode', v === 'history'); closeFull(); if (v === 'history') History.show(); else { History.hide(); } renderChrome(); if (v !== 'history') renderList(); animIn(v === 'history' ? $('#hview') : $('#cards')); }
function addAlgorithm() { const id = 'custom:' + Date.now(); S.custom.push({ id, custom: true, cat: st.cat || 'basic', level: 1, time: '', mem: '', names: { [S.lang]: T().newAlgo }, sum: {}, steps: {}, codes: { cpp: [{ name: 'solution.cpp', code: '' }], py: [{ name: 'solution.py', code: '' }] }, md: '', practice: [], text: '' }); persistNow(); inval(); st.tab = 'ov'; if (st.view === 'history') { st.view = 'lib'; $('#main').classList.remove('hist-mode'); History.hide(); } renderChrome(); renderList(); select(id); }
function dupAlgorithm(it) { const id = 'custom:' + Date.now(), c = JSON.parse(JSON.stringify({ names: it.names, sum: it.sum, steps: it.steps, codes: it.codes, practice: it.practice || [], cat: it.cat, level: it.level, mem: it.mem })); c.names = Object.fromEntries(Object.entries(c.names).map(([k, v]) => [k, v + ' (copy)'])); S.custom.push(Object.assign({ id, custom: true, md: '', text: '' }, c)); persistNow(); inval(); renderChrome(); renderList(true); select(id); }
function deleteAlgo(it) { if (!confirm(T().delConfirm)) return; if (it.custom) S.custom = S.custom.filter(i => i.id !== it.id); else if (!S.del.includes(it.id)) S.del.push(it.id); S.saved = S.saved.filter(i => i !== it.id); persistNow(); if (st.sel === it.id) st.sel = ''; fullRefresh(); }
function newItem() { if (st.view === 'history') return History.create(); if (!S.edit) setEdit(true); addAlgorithm(); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 1500); }
function toggleSave(id) { const i = S.saved.indexOf(id); if (i < 0) S.saved.push(id); else S.saved.splice(i, 1); persist(); renderChrome(); renderList(true); renderDetail(); }
function fullRefresh() { inval(); applyLook(); renderChrome(); renderList(true); if (!byId(st.sel)) st.sel = ''; renderDetail(); }
// ---------- cài đặt
function openModelWarn() {
  const t = T(), m = $('#warnModal'); if (!m) return;
  const rich = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  $('#warnTitle').textContent = t.modelWarnTitle;
  $('#warnBody').innerHTML = `<p>${rich(t.modelWarn1)}</p><p>${rich(t.modelWarn2)}</p>`;
  $('#warnClose').setAttribute('aria-label', t.close || 'Close'); $('#warnOk').textContent = t.modelWarnOk;
  m.hidden = false; $('#warnOk').focus();
}
async function openSettings() {
  const t = T(), m = $('#modal'); m.hidden = false; const tab = st.stab || 'gen';
  const sl = (k, lab, min, max, step, v) => `<div class="sl"><label for="s_${k}">${esc(lab)}</label><input id="s_${k}" data-k="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${v}"><output>${k === 'blur' ? v + 'px' : Math.round(v * 100) + '%'}</output></div>`;
  let body = '';
  if (tab === 'gen') { const c = await api.inv('cfg-get'), startOnLogin = !!c.startupSupported && !!c.startOnLogin;
    body = `<h5>${esc(t.stTheme)}</h5><div class="seg">${['light', 'dark'].map(x => `<button data-theme="${x}" class="${S.theme === x ? 'on' : ''}">${esc(t[x])}</button>`).join('')}</div>
  <h5>${esc(t.stLang)}</h5><div class="seg">${[['en', 'English'], ['vi', 'Tiếng Việt'], ['ru', 'Русский']].map(x => `<button data-lang="${x[0]}" class="${S.lang === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
  <h5>${esc(t.stEdit)}</h5><div class="tog"><button class="sw ${S.edit ? 'on' : ''}" id="swEdit" role="switch" aria-checked="${S.edit}" aria-label="${esc(t.editOn)}"></button><span>${esc(t.editOn)}</span></div>
  <h5>${esc(t.startupSection)}</h5><div class="tog"><button class="sw ${startOnLogin ? 'on' : ''}" id="swStartLogin" role="switch" aria-checked="${startOnLogin}" aria-label="${esc(t.startOnLogin)}" ${c.startupSupported ? '' : 'disabled'}></button><span>${esc(t.startOnLogin)}</span></div>
  <p class="hint">${esc(c.startupSupported ? t.startOnLoginHint : t.startOnLoginUnsupported)}</p>${c.startupError ? `<p class="hint err">${esc(t.startOnLoginFailed(c.startupError))}</p>` : ''}
  <h5>${esc(t.libBackupTitle)}</h5><p class="hint">${esc(t.libBackupHint)}</p><div class="row"><button id="libImport" class="btn">${esc(t.libImport)}</button><button id="libImportFolder" class="btn">${esc(t.libImportFolder)}</button><button id="libExport" class="btn">${esc(t.libExport)}</button></div>
  <h5>${esc(t.historyBackupTitle)}</h5><p class="hint">${esc(t.historyBackupHint)}</p><div class="row"><button id="exportZip" class="btn">${esc(t.exportZip)}</button><button id="importZip" class="btn">${esc(t.importZip)}</button><button id="importFolder" class="btn">${esc(t.importFolder)}</button></div>`; }
  else if (tab === 'bg') body = `<p class="hint">${esc(t.stBgHint)}</p>
  <div class="bgprev" id="bgprev" style="background-image:${S.bgUrl ? `url('${S.bgUrl}')` : (PRESETS[S.preset] || 'none')}"><i></i></div>
  <div class="row"><button class="btn pri" id="pickBg">${esc(t.pick)}</button><button class="btn" id="noBg">${esc(t.removeBg)}</button></div>
  <h5>${esc(t.presets)}</h5><div class="pres">${Object.keys(PRESETS).map(k => `<button data-preset="${k}" class="${!S.bgUrl && S.preset === k ? 'on' : ''}" style="background:${PRESETS[k]}" aria-label="${k}"></button>`).join('')}</div>
  ${sl('overlay', t.overlay, 0, 0.9, 0.01, S.overlay)}${sl('blur', t.blur, 0, 20, 1, S.blur)}${sl('panel', t.panel, 0.3, 1, 0.01, S.panel)}
  <div class="sl"><label>${esc(t.tint)}</label><div class="row"><input type="color" id="tintC" value="${S.tint || (S.theme === 'dark' ? '#0b0f1a' : '#ffffff')}"><button class="btn" id="tintAuto">${esc(t.tintAuto)}</button></div><span></span></div>
  <p class="hint">${esc(t.dropHint)}</p><button class="btn" id="resetAdj">${esc(t.reset)}</button>`;
  else if (tab === 'hist') { const c = await api.inv('cfg-get'), models = Array.isArray(c.modelList) ? [...new Set(c.modelList.filter(n => typeof n === 'string').map(n => n.trim()).filter(Boolean))] : [], selectedModel = models.includes(c.model) ? c.model : '';
    const modelOptions = models.map(model => `<option value="${esc(model)}" ${model === selectedModel ? 'selected' : ''}>${esc(model)}</option>`).join('');
    const modelStatus = c.modelListLoaded ? (models.length ? t.modelsOk(models.length) : t.modelsNone) : '';
    body = `<h5>${esc(t.histFolder)}</h5><div class="pathbox">${esc(c.root)}</div><div class="row"><button class="btn pri" id="pickRoot">${esc(t.chooseFolder)}</button><button class="btn" id="openRoot">${esc(t.openRoot)}</button></div>
    <h5>${esc(t.provider)}</h5><div class="row"><select id="providerIn" class="hkin"><option value="gemini" ${c.provider !== 'openai-compatible' ? 'selected' : ''}>Gemini</option><option value="openai-compatible" ${c.provider === 'openai-compatible' ? 'selected' : ''}>OpenAI-compatible</option></select></div>
    ${c.provider === 'openai-compatible' ? `<h5>${esc(t.baseUrl)}</h5><div class="row"><input id="baseUrlIn" class="hkin" style="flex:1;min-width:200px" value="${esc(c.baseUrl || '')}" spellcheck="false" placeholder="https://api.openai.com/v1"></div>` : ''}
    <h5>${esc(t.aiKey)} <button type="button" class="info-tip" title="${esc(t.aiKeyHint)}" aria-label="${esc(t.aiKeyHint)}">i</button> ${c.hasKey ? `<span class="badge" style="background:var(--ok-bg);color:var(--ok-t)">${esc(t.hasKey)}</span>` : ''}</h5>
    <div class="row"><input id="keyIn" type="password" class="hkin" style="flex:1;min-width:200px" autocomplete="off" placeholder="${c.hasKey ? '••••••••••••••••' : 'API key'}"><button class="btn pri" id="saveKey">${esc(t.saveKey)}</button>${c.hasKey ? `<button class="btn warn" id="clearKey">${esc(t.clearKey)}</button>` : ''}</div>
    <h5>${esc(t.model)}</h5><div class="row"><select id="modelOptions" class="hkin" style="flex:1;min-width:200px" data-current="${esc(selectedModel)}"><option value="" ${selectedModel ? '' : 'selected'}>${esc(t.chooseModel)}</option>${modelOptions}</select><button type="button" class="warn-btn" id="modelWarn" title="${esc(t.modelWarnLabel)}" aria-label="${esc(t.modelWarnLabel)}" aria-haspopup="dialog">!</button><button class="btn" id="loadModels">${esc(t.loadModels)}</button></div><p class="hint ${models.length ? 'okm' : ''}" id="aiMsg">${esc(modelStatus)}</p>
    <div class="tog"><button class="sw ${c.autoName ? 'on' : ''}" id="swAutoName" role="switch" aria-checked="${c.autoName}"></button><span>${esc(t.autoName)}</span></div>`; }
  else if (tab === 'about') body = `<h5>${esc(t.about)}</h5><p class="hint">${esc(t.author)}</p><div class="about-links"><a role="button" data-ext="https://github.com/BillIsMe211">${esc(t.github)} · github.com/BillIsMe211</a><div class="row"><span>${esc(t.contactEmail)}: <b>alphabezzy2n1@gmail.com</b></span></div></div>`;
  else { const c = await api.inv('cfg-get');
    const rows = [['capture', c.hotkey], ['captureRegion', c.hotkeyRegion], ['captureAppend', c.hotkeyAppend], ['new'], ['newFolder'], ['edit'], ['viewLib'], ['viewHist'], ['find'], ['settings'], ['rename'], ['copy'], ['cut'], ['paste'], ['del'], ['esc']];
    const row = r => `<tr><td><input class="hkin kin" readonly data-kact="${r[0]}" value="${esc(GLOBAL_KEYS[r[0]] ? fmtChord(r[1] || '').replace(/Super/g, IS_MAC ? 'Cmd' : 'Win') : fmtChord(keyOf(r[0])))}" placeholder="${esc(t.kOff)}" spellcheck="false" aria-label="${esc(KEY_LABEL(r[0]))}"></td><td>${esc(KEY_LABEL(r[0]))}</td></tr>`;
    body = `<p class="hint">${esc(t.kHint)}</p><table class="ktab">${rows.map(row).join('')}<tr><td><kbd>⌖ ${esc(t.kRightKey)}</kbd></td><td>${esc(t.kRight)}</td></tr></table><div class="row" style="margin-top:12px"><button class="link" id="kReset" type="button">${esc(t.kReset)}</button></div>`; }
  $('#dlgBody').innerHTML = `<h2>${esc(t.settings)}</h2><div class="stabs">${[['gen', t.sGeneral], ['bg', t.sBgTab], ['hist', t.sHist], ['keys', t.sKeys], ['about', t.about]].map(x => `<button data-stab="${x[0]}" class="${tab === x[0] ? 'on' : ''}">${esc(x[1])}</button>`).join('')}</div>${body}<div class="dlgf"><span></span><button class="btn pri" id="closeDlg">${esc(t.close)}</button></div>`;
}
async function setBg(src) { const u = await api.pickBg(src); if (u) { S.bgUrl = u; S.preset = ''; persistNow(); applyLook(); if (!$('#modal').hidden) openSettings(); } }
function setEdit(v) { S.edit = v; persistNow(); applyLook(); renderChrome(); renderDetail(); if (!$('#modal').hidden) openSettings(); }
let lastTA = null;
// ---------- sự kiện
document.addEventListener('mousedown', e => { if (e.target.closest('[data-act]')) e.preventDefault(); });
document.addEventListener('focusin', e => { if (e.target.classList && e.target.classList.contains('ta')) lastTA = e.target; });
document.addEventListener('click', e => {
  const g = s => e.target.closest(s); let x; const it = byId(st.sel);
  if ((x = g('[data-w]'))) return api.win(x.dataset.w);
  if ((x = g('[data-ext]'))) { e.preventDefault(); return api.openExt(x.dataset.ext); }
  if ((x = g('[data-nav]'))) return select(x.dataset.nav, { tab: 'ov' });
  if ((x = g('[data-bm]'))) { e.stopPropagation(); return toggleSave(x.dataset.bm); }
  if ((x = g('[data-cl]'))) { S.codeLang = x.dataset.cl; persist(); return renderDetail(); }
  if (g('[data-expand]')) { st.full = true; return renderFull(); }
  if (g('[data-collapse]') || g('#cfull .mask')) return closeFull();
  if ((x = g('[data-act]'))) { const ta = (lastTA && document.body.contains(lastTA)) ? lastTA : document.querySelector('.ta'); if (!ta) return; ta.focus(); const a = x.dataset.act;
    if (a === 'undo' || a === 'redo' || a === 'cut') document.execCommand(a); else if (a === 'all') ta.select(); return; }
  if (g('[data-addsnip]')) { const ext = S.codeLang === 'py' ? 'py' : 'cpp'; editCodes(it, S.codeLang, a => a.push({ name: 'snippet' + (a.length + 1) + '.' + ext, code: '' })); return renderDetail(); }
  if ((x = g('[data-delsnip]'))) { if (!confirm(T().delConfirm)) return; editCodes(it, S.codeLang, a => a.splice(+x.dataset.delsnip, 1)); return renderDetail(); }
  if (g('[data-closedetail]')) return closeDetail();
  if (g('[data-addprob]')) { const n = $('#prN').value.trim(), u = $('#prU').value.trim(); if (!n) return; if (u && !/^https?:\/\//i.test(u)) return toast(T().badUrl); upd(it.id, o => { o.practice = [...(it.practice || []), { t: n, u }]; }); return renderDetail(); }
  if ((x = g('[data-delprob]'))) { upd(it.id, o => { o.practice = (it.practice || []).filter((_, i) => i !== +x.dataset.delprob); }); return renderDetail(); }
  if (g('[data-addlink]')) { const n = $('#lkN').value.trim(), u = $('#lkU').value.trim(); if (!n || !u) return; if (!/^https?:\/\//i.test(u)) return toast(T().badUrl); upd(it.id, o => { o.links = [...buildLinks(it), { k: 'other', n, u }]; }); return renderDetail(); }
  if ((x = g('[data-dellink]'))) { upd(it.id, o => { o.links = buildLinks(it).filter((_, i) => i !== +x.dataset.dellink); }); return renderDetail(); }
  if (g('[data-delalgo]')) { if (!confirm(T().delConfirm)) return; if (it.custom) S.custom = S.custom.filter(i => i.id !== it.id); else if (!S.del.includes(it.id)) S.del.push(it.id); S.saved = S.saved.filter(i => i !== it.id); persistNow(); st.sel = ''; return fullRefresh(); }
  if (g('#addAlgo')) { addAlgorithm(); return; }
  if ((x = g('[data-tab]'))) { st.tab = x.dataset.tab; $('#detail').scrollTop = 0; renderDetail(); return animTabBody(); }
  if (g('#libExport')) { exportLibrary().catch(err => toast(err.message || String(err))); return; }
  if (g('#libImport')) { importLibrary().catch(err => toast(err.message || String(err))); return; }
  if (g('#libImportFolder')) { importLibrary('lib-import-folder').catch(err => toast(err.message || String(err))); return; }
  if ((x = g('.card'))) return select(x.dataset.id);
  if ((x = g('[data-view]'))) return setView(x.dataset.view);
  if ((x = g('[data-cat]'))) { if (st.view !== 'lib') setView('lib'); st.cat = x.dataset.cat; renderChrome(); renderList(); return animIn($('#cards')); }
  if (g('#fClear')) { Object.assign(st, { cat: '', level: 0, q: '', view: 'lib' }); $('#q').value = ''; renderChrome(); return renderList(); }
  if ((x = g('[data-stab]'))) { st.stab = x.dataset.stab; return openSettings().then(() => $('#dlgBody').querySelectorAll('.stabs ~ *').forEach(n => animIn(n))); }
  if (g('#pickRoot')) { api.inv('h-pickroot').then(() => openSettings()); return; }
  if (g('#openRoot')) { api.inv('h-open'); return; }
  if (g('#saveKey')) { const v = $('#keyIn').value.trim(); if (!v) return; api.inv('key-set', v).then(() => { toast(T().keySaved); openSettings(); }); return; }
  if (g('#clearKey')) { api.inv('key-set', '').then(() => { toast(T().keyCleared); openSettings(); }); return; }
  if (g('#modelWarn')) { openModelWarn(); return; }
  if (g('#warnClose') || g('#warnOk') || g('#warnModal .mask')) { $('#warnModal').hidden = true; return; }
  if (g('#loadModels')) { const b = g('#loadModels'), msg = $('#aiMsg'), list = $('#modelOptions'), current = list.dataset.current; b.disabled = true; msg.textContent = ''; api.inv('ai-models').then(r => { b.disabled = false; if (r && r.error) { msg.className = 'hint err'; msg.textContent = r.error === 'NO_KEY' ? T().noKey : T().modelsFailed(r.error); return; } if (!Array.isArray(r)) { msg.className = 'hint err'; msg.textContent = T().modelsFailed('Invalid response'); return; } const models = [...new Set(r.filter(n => typeof n === 'string').map(n => n.trim()).filter(Boolean))], options = document.createDocumentFragment(); for (const n of models) { const option = document.createElement('option'); option.value = n; option.textContent = n; options.appendChild(option); } const selected = models.includes(current) ? current : '', placeholder = list.options[0]; list.replaceChildren(placeholder, options); list.value = selected; list.dataset.current = selected; api.inv('cfg-set', { model: selected }); const count = list.options.length - 1; if (!count) { msg.className = 'hint err'; msg.textContent = T().modelsNone; return; } msg.className = 'hint okm'; msg.textContent = T().modelsOk(count); }).catch(e => { b.disabled = false; msg.className = 'hint err'; msg.textContent = T().modelsFailed(e.message || String(e)); }); return; }
  if (g('#swAutoName')) { const on = !g('#swAutoName').classList.contains('on'); api.inv('cfg-set', { autoName: on }).then(() => openSettings()); return; }
  if (g('#swStartLogin')) { const on = !g('#swStartLogin').classList.contains('on'); api.inv('cfg-set', { startOnLogin: on }).then(c => { if (c && c.startupError) toast(T().startOnLoginFailed(c.startupError)); openSettings(); }).catch(e => { toast(T().startOnLoginFailed(e.message || String(e))); openSettings(); }); return; }
  if (g('#exportZip') || g('#importZip') || g('#importFolder')) {
    const isExp = !!g('#exportZip'), isFolder = !!g('#importFolder'), btn = isExp ? g('#exportZip') : isFolder ? g('#importFolder') : g('#importZip'); if (btn.disabled) return; btn.disabled = true; const old = btn.textContent; btn.textContent = isExp ? T().exporting : T().importing;
    return api.inv(isExp ? 'h-export-zip' : isFolder ? 'h-import-folder' : 'h-import-zip').then(r => {
      if (!r || r.canceled) return; if (r.error) return toast(r.error);
      const imported = (r.imported || 0) + (r.importedGroups || 0);
      toast(isExp ? T().exportDone(r.count) : (imported ? T().folderImportDone(imported) : T().importNone));
    }).finally(() => { btn.disabled = false; btn.textContent = old; });
  }
  if (g('#kReset')) { S.keys = {}; persistNow(); renderChrome(); api.inv('cfg-set', { hotkey: 'Ctrl+Alt+S', hotkeyRegion: 'Ctrl+Alt+R', hotkeyAppend: 'Ctrl+Alt+A' }).then(() => openSettings()); return; }
  if (g('#openSettings')) return openSettings();
  if (g('#ebExit')) return setEdit(false);
  if (g('#swEdit')) return setEdit(!S.edit);
  if (g('#closeDlg') || g('#modal .mask')) { $('#modal').hidden = true; return; }
  if ((x = g('button[data-theme]'))) { S.theme = x.dataset.theme; persistNow(); api.setTheme(S.theme); applyLook(); return openSettings(); }
  if ((x = g('[data-lang]'))) { S.lang = x.dataset.lang; api.setLang(S.lang); persistNow(); applyLook(); renderChrome(); renderList(true); renderDetail(); History.rerender(); return openSettings(); }
  if ((x = g('[data-preset]'))) { S.preset = x.dataset.preset; S.bgUrl = ''; persist(); applyLook(); return openSettings(); }
  if (g('#pickBg')) return setBg(null);
  if (g('#noBg')) { S.bgUrl = ''; S.preset = ''; persist(); applyLook(); return openSettings(); }
  if (g('#tintAuto')) { S.tint = ''; persist(); applyLook(); return openSettings(); }
  if (g('#resetAdj')) { Object.assign(S, { overlay: DEF.overlay, blur: DEF.blur, panel: DEF.panel, tint: '' }); persist(); applyLook(); return openSettings(); }
});
document.addEventListener('input', e => {
  const t = e.target, it = byId(st.sel);
  if (t.classList && t.classList.contains('ta')) { refreshGutterSoon(t, t.previousElementSibling); const i = +t.dataset.i; editCodes(it, S.codeLang, a => { if (a[i]) a[i].code = t.value; }); return; }
  if (t.dataset && t.dataset.snname !== undefined) { const i = +t.dataset.snname; editCodes(it, S.codeLang, a => { if (a[i]) a[i].name = t.value; }); return; }
  if (t.dataset && t.dataset.f && it) { const f = t.dataset.f, v = t.value;
    upd(it.id, o => { if (f === 'name') o.names = Object.assign({}, o.names, { [S.lang]: v }); else if (f === 'sum') o.sum = Object.assign({}, o.sum, { [S.lang]: v }); else if (f === 'steps') o.steps = Object.assign({}, o.steps, { [S.lang]: v.split('\n').map(s => s.trim()).filter(Boolean) });
      else if (f === 'level') o.level = +v; else o[f] = v; }); return; }
  if (t.id === 'q') { st.q = t.value; renderList(); return; }
  if (t.dataset && t.dataset.k) { S[t.dataset.k] = +t.value; t.nextElementSibling.textContent = t.dataset.k === 'blur' ? t.value + 'px' : Math.round(t.value * 100) + '%'; persist(); applyLook(); }
  if (t.id === 'tintC') { S.tint = t.value; persist(); applyLook(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'providerIn') { api.inv('cfg-set', { provider: t.value }).then(() => openSettings()); return; }
  if (t.id === 'baseUrlIn') { api.inv('cfg-set', { baseUrl: t.value.trim() }).then(() => openSettings()); return; }
  if (t.id === 'modelOptions') { t.dataset.current = t.value; api.inv('cfg-set', { model: t.value }); return; }
  if (t.id === 'fLevel') { st.level = +t.value; renderList(); } if (t.id === 'sort') { st.sort = t.value; renderList(); }
  if (t.dataset && t.dataset.f) { inval(); renderChrome(); renderList(true); if (['cat', 'level', 'name'].includes(t.dataset.f)) renderDetail(); }
});
const GLOBAL_KEYS = { capture: 'hotkey', captureRegion: 'hotkeyRegion', captureAppend: 'hotkeyAppend' };
const KEY_LABEL = a => ({ capture: T().kCapture, captureRegion: T().kCaptureRegion, captureAppend: T().kCaptureAppend, new: T().kNew, newFolder: T().kNewFolder, edit: T().kEdit, viewLib: T().kViewLib, viewHist: T().kViewHist,  find: T().kFind, settings: T().kSettings, rename: T().kRename, copy: T().kCopy, cut: T().kCut, paste: T().kPaste, del: T().kDel, esc: T().kEsc }[a] || a);
function captureKey(e) {
  const el = e.target, a = el.dataset.kact; if (e.key === 'Tab') return;
  e.preventDefault(); e.stopPropagation();
  if (e.key === 'Escape') { el.blur(); return; }
  if (e.key === 'Backspace') { if (GLOBAL_KEYS[a]) return api.inv('cfg-set', { [GLOBAL_KEYS[a]]: '' }).then(() => openSettings()); S.keys[a] = ''; persistNow(); return openSettings(); }
  if (GLOBAL_KEYS[a]) { const v = accel(e); if (!v) return;
    return api.inv('cfg-get').then(cc => { const dup = Object.keys(GLOBAL_KEYS).find(k => k !== a && cc[GLOBAL_KEYS[k]] === v); if (dup) return toast(`${T().kUsed}: ${KEY_LABEL(dup)}`);
      return api.inv('cfg-set', { [GLOBAL_KEYS[a]]: v }).then(c => { openSettings(); if (!c[GLOBAL_KEYS[a] + 'Ok']) toast(T().hotkeyFail); }); }); }
  const ch = chordOf(e); if (!ch) return;
  if (!validChord(ch)) { toast(T().kNeedMod); return; }
  const dup = Object.keys(KEY_DEF).find(x => x !== a && keyOf(x) === ch); if (dup) { toast(`${T().kUsed}: ${KEY_LABEL(dup)}`); return; }
  S.keys[a] = ch; persistNow(); renderChrome(); openSettings();
}
function accel(e) {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null; const m = []; if (e.ctrlKey) m.push('Ctrl'); if (e.altKey) m.push('Alt'); if (e.shiftKey) m.push('Shift'); if (e.metaKey) m.push('Super'); if (!m.length) return null;
  let k = null; if (/^Key[A-Z]$/.test(e.code)) k = e.code.slice(3); else if (/^Digit\d$/.test(e.code)) k = e.code.slice(5); else if (/^F\d{1,2}$/.test(e.key)) k = e.key; else k = { ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', ' ': 'Space', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace', Delete: 'Delete', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown', Insert: 'Insert' }[e.key];
  return k ? [...m, k].join('+') : null;
}
document.addEventListener('mousedown', e => { if (!e.target.closest('.ctx')) closeMenu(); }, true);
document.addEventListener('click', e => { const m = document.querySelector('.ctx'); if (m && !m.contains(e.target)) closeMenu(); }, true);
document.addEventListener('scroll', e => { const m = document.querySelector('.ctx'); if (m && !m.contains(e.target)) closeMenu(); }, true);
window.addEventListener('blur', closeMenu);
document.addEventListener('keydown', e => {
  if (document.querySelector('.askwrap')) return;
  if (e.target && e.target.id === 'hkIn') { if (e.key === 'Tab') return; e.preventDefault(); e.stopPropagation(); if (e.key === 'Escape') { e.target.blur(); return; } if (e.key === 'Backspace') { api.inv('cfg-set', { hotkey: '' }).then(() => openSettings()); return; } const a = accel(e); if (a) api.inv('cfg-set', { hotkey: a }).then(c => { openSettings(); if (!c.hotkeyOk) toast(T().hotkeyFail); }); return; }
  if (e.target && e.target.dataset && e.target.dataset.kact) { captureKey(e); return; }
  if (e.key === 'Tab' && e.target && e.target.id === 'hta') return;
  if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.classList && e.target.classList.contains('ta')) { indentEditor(e.target, e); return; }
  if (e.key === 'Escape' && document.querySelector('.ctx')) { e.preventDefault(); e.stopImmediatePropagation(); closeMenu(); return; }
  const ch = chordOf(e);
  if (ch) {
    if (ch === keyOf('new')) { e.preventDefault(); return newItem(); } if (ch === keyOf('edit')) { e.preventDefault(); return setEdit(!S.edit); }
    if (ch === keyOf('viewLib')) { e.preventDefault(); return setView('lib'); } if (ch === keyOf('viewHist')) { e.preventDefault(); return setView('history'); }
    if (ch === keyOf('settings')) { e.preventDefault(); return openSettings(); }
  }
  if (isKey(e, 'find')) { e.preventDefault(); const f = st.view === 'history' ? $('#hq') : $('#q'); if (f) { f.focus(); f.select(); } return; }
  if (isKey(e, 'esc')) { if (!$('#warnModal').hidden) { $('#warnModal').hidden = true; return; } if (st.full) { closeFull(); return; } if (!$('#modal').hidden) $('#modal').hidden = true; else if (document.activeElement === $('#q')) { $('#q').value = ''; st.q = ''; renderList(); } else if (st.sel && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) closeDetail(); return; }
  const tag = document.activeElement.tagName; if (!$('#modal').hidden || !$('#warnModal').hidden || st.full || (/SELECT|INPUT|TEXTAREA/.test(tag) && document.activeElement.id !== 'q')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!LIST.length) return; e.preventDefault(); let i = LIST.findIndex(x => x.id === st.sel); i = Math.max(0, Math.min(LIST.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))); select(LIST[i].id); }
  if (e.key === 'Enter' && (document.activeElement === $('#q') || document.activeElement === document.body)) { if (st.sel) { st.tab = 'ov'; renderDetail(); } else if (LIST[0]) select(LIST[0].id, { tab: 'ov' }); }
  if (e.key === 'Enter' && document.activeElement.matches('.card')) select(document.activeElement.dataset.id, { tab: 'ov' });
});
let dragKey = null;
document.addEventListener('dragstart', e => { const g = e.target.closest && e.target.closest('[data-grip]'); if (!g) return; dragKey = g.dataset.grip; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragKey); const b = g.closest('.blk'); if (b) { b.classList.add('dragging'); try { e.dataTransfer.setDragImage(b, 20, 10); } catch (x) {} } });
document.addEventListener('dragover', e => { if (!dragKey) return; const b = e.target.closest && e.target.closest('.blk'); document.querySelectorAll('.blk.over').forEach(x => x.classList.remove('over')); if (b && b.dataset.blk !== dragKey) { e.preventDefault(); b.classList.add('over'); } });
document.addEventListener('drop', e => { if (!dragKey) return; const b = e.target.closest && e.target.closest('.blk'); if (b && b.dataset.blk !== dragKey) { e.preventDefault(); e.stopPropagation(); const o = blockOrder().filter(k => k !== dragKey), i = o.indexOf(b.dataset.blk); const before = e.clientY < b.getBoundingClientRect().top + b.offsetHeight / 2; o.splice(before ? i : i + 1, 0, dragKey); S.order = o; persistNow(); } dragKey = null; renderDetail(); }, true);
document.addEventListener('dragend', () => { dragKey = null; document.querySelectorAll('.blk.dragging,.blk.over').forEach(x => x.classList.remove('dragging', 'over')); });
(function splitter() { const g = $('#gutter'), root = document.documentElement; const set = w => root.style.setProperty('--listw', Math.max(280, Math.min(640, w)) + 'px'); if (S.listW) set(S.listW);
  g.addEventListener('mousedown', e => { e.preventDefault(); g.classList.add('drag'); const left = $('#split').getBoundingClientRect().left; const mv = ev => { S.listW = Math.max(280, Math.min(640, ev.clientX - left)); set(S.listW); }; const up = () => { g.classList.remove('drag'); document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); persistNow(); }; document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); });
  g.addEventListener('dblclick', () => { delete S.listW; root.style.removeProperty('--listw'); persistNow(); }); })();
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) setBg(api.pathOf(f)); });
document.addEventListener('contextmenu', e => {
  if (e.target.closest('#hview')) return; const t = T();
  const c = e.target.closest('.card'); if (c) { e.preventDefault(); const it = byId(c.dataset.id); if (!it) return; const sv = S.saved.includes(it.id);
    return menu(e.clientX, e.clientY, [{ label: t.open, run: () => select(it.id) }, { label: sv ? t.savedBtn + ' ✓' : t.save, run: () => toggleSave(it.id) }, { sep: 1 }, ...(S.edit ? [{ label: t.dup, run: () => dupAlgorithm(it) }, { label: t.delAlgo, danger: 1, run: () => deleteAlgo(it) }] : [{ label: t.enableEdit, keys: keyLabel('edit'), run: () => setEdit(true) }])]); }
  const cb = e.target.closest('.code[data-ov]'); if (cb) { e.preventDefault(); const it = byId(st.sel); if (!it) return;
    return menu(e.clientX, e.clientY, [{ label: t.copy, run: () => navigator.clipboard.writeText(codesOf(it, S.codeLang).map(x => x.code).join('\n\n')).then(() => toast(t.copied)) }, { label: st.full ? t.collapse : t.expand, run: () => { if (st.full) closeFull(); else { st.full = true; renderFull(); } } }, { label: S.codeLang === 'cpp' ? 'Python' : 'C++', run: () => { S.codeLang = S.codeLang === 'cpp' ? 'py' : 'cpp'; persist(); renderDetail(); } }, { sep: 1 }, { label: S.edit ? t.exitEdit : t.enableEdit, keys: keyLabel('edit'), run: () => setEdit(!S.edit) }]); }
});
// ---------- khởi động
api.setLang(S.lang); applyLook(); renderChrome(); renderList();
st.sel = '';
window.__core = { S, st, T, esc, isKey, keyLabel, IC, toast, menu, closeMenu, ask, setView, openSettings, showHistoryHelp, setEdit, api, persist: persistNow, renderChrome: () => renderChrome() };
History.init(window.__core);
window.__algo = { setView, select, S, st, openSettings, applyLook, setEdit, items, setState: o => { Object.assign(st, o); renderChrome(); renderList(); } };
renderDetail();
})();
