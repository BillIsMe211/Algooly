window.History = (() => {
  let C, api, list = [], groups = [], cfg = { hotkey: 'Ctrl+Alt+S' }, active = false, built = false, cur = null, saveT = null, solRenderCancel = null, dragSource = null;
  let imageState = { id: '', zoom: 1, x: 0, y: 0, fullscreen: false, drag: null, idx: 0, n: 0 };
  const hs = { q: '', site: '', status: '', range: '', sortKey: 'created', sortDir: 'desc', collapsed: {}, dateCollapsed: {}, statsOpen: false, sel: '', selected: [], anchor: null, marquee: null, currentGroupId: '' };
  let folderClipboard = { mode: '', entries: [] };
  const $ = s => document.querySelector(s), esc = s => C.esc(s), T = () => C.T(), LOC = () => ({ vi: 'vi-VN', en: 'en-US', ru: 'ru-RU' }[C.S.lang] || 'vi-VN');
  const FOLDER = '<svg class="fico" viewBox="0 0 48 38" width="38" height="30"><path class="fb" d="M2 7a4 4 0 014-4h11l5 5h20a4 4 0 014 4v21a4 4 0 01-4 4H6a4 4 0 01-4-4z" fill="#b6d1fb"/><rect class="fp" x="8" y="9" width="32" height="20" rx="2.5" fill="#fff"/><path class="ff" d="M2 14a4 4 0 014-4h36a4 4 0 014 4v18a4 4 0 01-4 4H6a4 4 0 01-4-4z" fill="#cfe0fd"/></svg>';
  const CHECK = '<svg class="ck" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.6 6.4l2.3 2.3 4.5-5"/></svg>';
  const stOf = i => i.solved ? 'solved' : '';
  const TAGS = ['AC', 'WA', 'TLE', 'RTE', 'MLE'], VERDICTS = ['WA', 'TLE', 'RTE', 'MLE'], VTITLE = { AC: 'Accepted', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', RTE: 'Runtime Error', MLE: 'Memory Limit Exceeded' };
  const STAR = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M7 1.6l1.6 3.4 3.7.5-2.7 2.6.7 3.7L7 10.1 3.7 11.8l.7-3.7L1.7 5.5 5.4 5z"/></svg>';
  const SVG = d => `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = { dots: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>', stats: SVG('<path d="M2 11.5V8M5.5 11.5V4.5M9 11.5V6.5M12.5 11.5V2.5"/>'), zip: SVG('<path d="M3 1.5h5l2.5 2.5v7.8H3zM8 1.5V4h2.5M5 5.5h3M5 7.5h3M6.5 9.5v1.7M5.5 11.2h2"/>'), x: SVG('<path d="M2.5 2.5l8 8M10.5 2.5l-8 8"/>'), folder: SVG('<path d="M1.5 3.8A1.3 1.3 0 012.8 2.5h2.6l1.2 1.4h3.6a1.3 1.3 0 011.3 1.3v4.6a1.3 1.3 0 01-1.3 1.3H2.8a1.3 1.3 0 01-1.3-1.3z"/>'), file: SVG('<path d="M3 1.8h4.5l2.5 2.5v7.9H3zM7.5 1.8v2.5H10M4.7 7h3.6M4.7 9h3.6"/>'), plus: SVG('<path d="M6.5 2.5v8M2.5 6.5h8"/>'), spark: SVG('<path d="M6.5 1.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3L2 6l3.3-1.2z"/>'), cal: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.8" y="2.8" width="10.4" height="9.4" rx="1.6"/><path d="M1.8 5.8h10.4M4.6 1.6v2.4M9.4 1.6v2.4"/></svg>' };
  const ROWICO = '<svg viewBox="0 0 18 14" width="18" height="14" fill="currentColor" aria-hidden="true"><path d="M1 2.4A1.4 1.4 0 012.4 1h4.2l1.5 1.7h7.5A1.4 1.4 0 0117 4.1v7.5A1.4 1.4 0 0115.6 13H2.4A1.4 1.4 0 011 11.6z"/></svg>';
  const LAYOUT_ICO = { cards: SVG('<rect x="1.8" y="1.8" width="3.8" height="3.8" rx="1"/><rect x="7.4" y="1.8" width="3.8" height="3.8" rx="1"/><rect x="1.8" y="7.4" width="3.8" height="3.8" rx="1"/><rect x="7.4" y="7.4" width="3.8" height="3.8" rx="1"/>'), list: SVG('<path d="M1.6 3h1.8M5.4 3h6M1.6 6.5h1.8M5.4 6.5h6M1.6 10h1.8M5.4 10h6"/>') };
  const IMGICO = {
    zoomIn: SVG('<circle cx="5.4" cy="5.4" r="3.6"/><path d="M8 8l3 3M5.4 3.7v3.4M3.7 5.4h3.4"/>'),
    zoomOut: SVG('<circle cx="5.4" cy="5.4" r="3.6"/><path d="M8 8l3 3M3.7 5.4h3.4"/>'),
    reset: SVG('<path d="M2.3 5a4.5 4.5 0 017.7-2.7L11 3"/><path d="M11 1v2.5H8.5M10.7 8a4.5 4.5 0 01-7.7 2.7L2 10"/><path d="M2 12V9.5h2.5"/>'),
    full: SVG('<path d="M2 5V2h3M8 2h3v3M11 8v3H8M5 11H2V8"/>'),
    exitFull: SVG('<path d="M2 5h3V2M8 2v3h3M11 8H8v3M5 11V8H2"/>'),
    rot: SVG('<path d="M10.6 6.5a4.1 4.1 0 11-1.3-3M10.7 1.9v2.5H8.2"/>'),
    chev: d => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`,
    plus: SVG('<path d="M6.5 2v9M2 6.5h9"/>'),
    trash: SVG('<path d="M2.4 3.6h8.2M5 3.6V2.3h3v1.3M3.6 3.6l.5 7.1h4.8l.5-7.1M5.4 5.6v3.4M7.6 5.6v3.4"/>'),
    copy: SVG('<rect x="4.2" y="4.2" width="6.8" height="6.8" rx="1.3"/><path d="M8.8 4.2V3a1 1 0 00-1-1H3a1 1 0 00-1 1v4.8a1 1 0 001 1h1.2"/>'),
    ext: SVG('<path d="M5.6 2.6H2.8a.8.8 0 00-.8.8v6.8c0 .44.36.8.8.8h6.8a.8.8 0 00.8-.8V7.4M7.6 2h3.4v3.4M11 2L6 7"/>')
  };
  const ymd = ms => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const fmtDate = ms => { const d = new Date(ms), p = n => String(n).padStart(2, '0'), day = C.S.lang === 'en' ? `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}` : `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; return `${day} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const hhmm = ms => new Date(ms).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit', hour12: false });
  const byId = id => list.find(i => i.id === id);
  const entryKey = entry => `${entry.kind}:${entry.id}`;
  const isSelected = (kind, id) => hs.selected.some(entry => entry.kind === kind && entry.id === id);
  function selectableEntries() { return Array.from(document.querySelectorAll('#hgroups [data-hdrag]')).map(node => ({ id: node.dataset.hid, kind: node.dataset.hdrag, node })); }
  function updateSelection() { renderBar(); render(); }
  function setSelection(entries, anchor) {
    const unique = new Map(entries.map(entry => [entryKey(entry), { id: entry.id, kind: entry.kind }]));
    hs.selected = [...unique.values()]; if (anchor) hs.anchor = entryKey(anchor);
    updateSelection();
  }
  function navigateTo(id = '') {
    if (id && !groups.some(group => group.id === id)) return;
    if (cur) closeDrawer();
    hs.currentGroupId = id; hs.sel = ''; hs.selected = []; hs.anchor = null; renderBar(); render();
    const hg = $('#hgroups'); if (hg && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { hg.classList.remove('enter-slide'); void hg.offsetWidth; hg.classList.add('enter-slide'); }
  }
  const extName = n => { const e = (n.match(/\.(\w+)$/) || [, ''])[1].toLowerCase(); return { cpp: 'C++', cc: 'C++', cxx: 'C++', c: 'C', py: 'Py', java: 'Java', js: 'JS', kt: 'Kt', rs: 'Rust', go: 'Go', cs: 'C#' }[e] || e.toUpperCase(); };
  function highlightedCode(value, lang) { if (value.length > 120000) return esc(value); try { return hljs.highlight(value, { language: lang === 'py' ? 'python' : 'cpp', ignoreIllegals: true }).value; } catch (e) { return esc(value); } }
  function refreshSolutionSoon(ta) {
    if (solRenderCancel) solRenderCancel();
    const gutter = $('#hlines'), code = $('#hhl code');
    if (!ta || !gutter || !code) return;
    const value = ta.value, lines = lineCount(value);
    if (gutter.textContent.split('\n').length !== lines) gutter.textContent = lineNumbers(lines);
    code.textContent = value;
    const render = () => {
      solRenderCancel = null;
      if ($('#hta') !== ta || ta.value !== value) return;
      if (value.length > 120000) return;
      code.innerHTML = highlightedCode(value, cur ? cur.lang : 'cpp');
    };
    if (window.requestIdleCallback) {
      const id = requestIdleCallback(render, { timeout: 250 });
      solRenderCancel = () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(render, 100);
      solRenderCancel = () => clearTimeout(id);
    }
  }
  function indentSolution(e) {
    const ta = e.target, value = ta.value, start = ta.selectionStart, end = ta.selectionEnd;
    e.preventDefault();
    if (start === end) {
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1, match = value.slice(lineStart).match(/^ {1,4}/), remove = match ? match[0].length : 0;
        if (remove) ta.setRangeText('', lineStart, lineStart + remove, 'end');
        else return;
      } else ta.setRangeText('    ', start, end, 'end');
    } else {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const newline = value.indexOf('\n', Math.max(start, end - 1)), lineEnd = newline < 0 ? value.length : newline;
      const lines = value.slice(lineStart, lineEnd).split('\n');
      const next = lines.map(line => e.shiftKey ? line.replace(/^ {1,4}/, '') : '    ' + line).join('\n');
      ta.setRangeText(next, lineStart, lineEnd, 'select');
    }
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const difficultyName = value => ({ Easy: T().diffEasy, Medium: T().diffMedium, Hard: T().diffHard }[value] || value);
  function lineCount(text) { let count = 1; for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) count++; return count; }
  function lineNumbers(count) { let lines = '1'; for (let i = 2; i <= count; i++) lines += '\n' + i; return lines; }
  function ratingDetails(item, t) {
    if (item.meta.rating) return { label: `${t.rating}: ${item.meta.rating}`, className: 'rating', title: t.rating };
    if (item.meta.ratingEstimate) return { label: `${t.ratingEstimate}: ~${item.meta.ratingEstimate}`, className: 'rating estimated', title: t.ratingEstimateHint };
    if (item.meta.ratingEstimateStatus === 'pending') return { label: t.ratingEstimatePending, className: 'rating missing', title: t.ratingEstimateHint };
    if (item.meta.ratingEstimateStatus === 'error') return { label: t.ratingEstimateFailed, className: 'rating missing', title: t.ratingEstimateFailed };
    if (item.meta.ratingEstimateStatus === 'unavailable') return { label: t.ratingEstimateUnavailable, className: 'rating missing', title: t.ratingEstimateHint };
    const state = item.meta.ratingStatus === 'unrated' ? t.unrated : t.ratingUnknown;
    return { label: `${t.rating}: ${state}`, className: 'rating missing', title: item.meta.ratingStatus === 'unrated' ? t.unrated : t.ratingUnknown };
  }

  function init(core) {
    C = core; api = core.api;
    api.on('history-changed', (() => { let t; return () => { clearTimeout(t); t = setTimeout(load, 180); }; })());
    api.on('history-new', (id, name) => { C.toast(T().capSaved(name)); });
    api.on('toast', m => C.toast(m));
    api.inv('cfg-get').then(c => { cfg = c; }); load();
    document.addEventListener('click', onClick); document.addEventListener('dblclick', onDoubleClick); document.addEventListener('contextmenu', onCtx); document.addEventListener('input', onInput); document.addEventListener('change', onChange); document.addEventListener('keydown', onKey); document.addEventListener('focusout', onBlur);
    document.addEventListener('wheel', onImageWheel, { passive: false }); document.addEventListener('pointerdown', onImageDown); document.addEventListener('pointermove', onImageMove); document.addEventListener('pointerup', onImageUp); document.addEventListener('pointercancel', onImageUp);
    document.addEventListener('pointerdown', onSelectionDown); document.addEventListener('pointermove', onSelectionMove); document.addEventListener('pointerup', onSelectionUp); document.addEventListener('pointercancel', onSelectionUp);
    document.addEventListener('dragstart', onDragStart); document.addEventListener('dragover', onDragOver); document.addEventListener('dragleave', onDragLeave); document.addEventListener('drop', onDrop); document.addEventListener('dragend', onDragEnd);
  }
  async function load() {
    const r = await api.inv('h-scan'); list = r && Array.isArray(r.items) ? r.items : []; groups = r && Array.isArray(r.groups) ? r.groups : []; api.inv('cfg-get').then(c => { cfg = c; });
    while (hs.currentGroupId && !groups.some(group => group.id === hs.currentGroupId)) hs.currentGroupId = groups.find(group => group.id === hs.currentGroupId.slice(0, hs.currentGroupId.lastIndexOf('/')))?.id || '';
    C.renderChrome(); if (!active) return; fillSites(); render();
    if (cur) { const i = byId(cur.id); if (!i) closeDrawer(); else { drawerHead(i); drawerImg(i); } }
  }
  function show() { active = true; if (!built) build(); renderBar(); load(); }
  function hide() { active = false; }
  function rerender() { if (!active) return; renderBar(); render(); if (cur) openDrawer(cur.id, cur.lang, true); }
  function build() { built = true; $('#hview').innerHTML = '<div id="hmain"><div id="hbar"></div><div id="hstats"></div><div id="hgroups"><div id="hfolder-list"></div><div id="hmarquee" hidden></div></div></div><div id="hdrawer" hidden></div>'; }

  // ---------- thanh công cụ
  const opt = (v, cur, lab) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`;
  function renderBar() {
    const t = T(), layout = C.S.historyLayout === 'list' || C.S.historyLayout === 'tree' ? 'list' : 'cards'; $('#hbar').innerHTML = `<div class="hsearch"><svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M12.2 12.2L16 16"/></svg><input id="hq" value="${esc(hs.q)}" placeholder="${esc(t.hSearch)}" spellcheck="false" autocomplete="off"></div>
    <span class="sel"><select id="hSite"></select></span>
    <span class="sel"><select id="hStatus">${opt('', hs.status, t.fStatus + ': ' + t.sAll)}${opt('sol', hs.status, t.sSol)}${opt('nosol', hs.status, t.sNoSol)}${VERDICTS.map(v => opt(v, hs.status, v)).join('')}${opt('star', hs.status, t.sStar)}</select></span>
    <span class="sel"><select id="hRange">${opt('', hs.range, t.fRange + ': ' + t.sAll)}${opt('today', hs.range, t.rToday)}${opt('7', hs.range, t.r7)}${opt('30', hs.range, t.r30)}</select></span>
    <span class="sp"></span><button class="info-tip hhelp" data-hact="help" title="${esc(t.histHelpTitle)}" aria-label="${esc(t.histHelpTitle)}">?</button><button class="hb ic" data-hact="stats" title="${esc(t.statsT)}" aria-label="${esc(t.statsT)}">${ICO.stats}</button><div class="seg h-layout" role="group" aria-label="${esc(t.historyLayoutLabel)}">${['cards', 'list'].map(k => `<button data-hlayout="${k}" class="${layout === k ? 'on' : ''}" aria-pressed="${layout === k}" title="${esc(k === 'cards' ? t.historyLayoutCards : t.historyLayoutTree)}" aria-label="${esc(k === 'cards' ? t.historyLayoutCards : t.historyLayoutTree)}">${LAYOUT_ICO[k]}</button>`).join('')}</div><button class="hb ic" data-hact="root" title="${esc(t.openRoot)}" aria-label="${esc(t.openRoot)}">${ICO.folder}</button><button class="hb" data-hact="newgroup">${ICO.plus}<span>${esc(t.newGroup)}</span></button><button class="hb pri" data-hact="new">${ICO.plus}<span>${esc(t.newItem)}</span></button>`; fillSites();
  }
  function fillSites() { const s = $('#hSite'); if (!s) return; const t = T(), sites = [...new Set(list.map(i => i.meta.site).filter(Boolean))].sort(); if (hs.site && !sites.includes(hs.site)) hs.site = ''; s.innerHTML = opt('', hs.site, t.fSite + ': ' + t.sAll) + sites.map(x => opt(x, hs.site, x)).join(''); }
  function filt() {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0), q = hs.q.trim().toLowerCase(); const lim = hs.range === 'today' ? 0 : hs.range === '7' ? 6 : hs.range === '30' ? 29 : -1;
    return list.filter(i => {
      if (hs.site && i.meta.site !== hs.site) return false; if (hs.status === 'nosol' && i.solved) return false; if (hs.status === 'sol' && !i.solved) return false; if (VERDICTS.includes(hs.status) && !(i.verdicts || []).includes(hs.status)) return false; if (hs.status === 'star' && !i.meta.star) return false;
      if (lim >= 0) { const d = new Date(i.day + 'T00:00:00'); if ((t0 - d) / 864e5 > lim) return false; }
      if (q && !(i.name + ' ' + i.meta.site + ' ' + i.meta.title + ' ' + i.meta.pid + ' ' + i.meta.tags.join(' ')).toLowerCase().includes(q)) return false; return true; }).sort((a, b) => b.createdAt - a.createdAt);
  }
  // ---------- thống kê (heatmap)
  function stats() {
    const cnt = {}; list.forEach(i => { if (i.solvedAt) { const k = ymd(i.solvedAt); cnt[k] = (cnt[k] || 0) + 1; } });
    const today = new Date(); today.setHours(0, 0, 0, 0); const tk = ymd(today), sum = n => { let s = 0; for (let k = 0; k < n; k++) { const d = new Date(today); d.setDate(d.getDate() - k); s += cnt[ymd(d)] || 0; } return s; };
    let streak = 0; const d = new Date(today); if (!cnt[ymd(d)]) d.setDate(d.getDate() - 1); while (cnt[ymd(d)]) { streak++; d.setDate(d.getDate() - 1); }
    return { cnt, today: cnt[tk] || 0, week: sum(7), total: Object.values(cnt).reduce((a, b) => a + b, 0), streak, year: sum(365) };
  }
  function statsHtml() {
    const t = T(); if (!hs.statsOpen) return ''; const s = stats(), today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - today.getDay() - 52 * 7); const lvl = n => n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0;
    let cells = '', months = '', lastM = -1, lastC = -9;
    for (let w = 0; w < 53; w++) { const first = new Date(start); first.setDate(first.getDate() + w * 7); if (first.getMonth() !== lastM && first <= today) { lastM = first.getMonth(); if (w - lastC >= 4) { lastC = w; months += `<span style="grid-column:${w + 1}">${esc(first.toLocaleDateString(LOC(), { month: 'short' }))}</span>`; } }
      for (let r = 0; r < 7; r++) { const d = new Date(start); d.setDate(d.getDate() + w * 7 + r); if (d > today) continue; const k = ymd(d), n = s.cnt[k] || 0;
        cells += `<i class="hc l${lvl(n)} ${k === ymd(today) ? 'now' : ''}" style="grid-column:${w + 1};grid-row:${r + 1}" title="${esc(n + ' ' + t.solDay + ' · ' + d.toLocaleDateString(LOC(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))}"></i>`; } }
    const dn = [1, 3, 5].map(r => { const d = new Date(start); d.setDate(d.getDate() + r); return `<span style="grid-row:${r + 1}">${esc(d.toLocaleDateString(LOC(), { weekday: 'short' }))}</span>`; }).join('');
    return `<div class="hst"><div class="heat"><div class="heat-title">${esc(t.pastYear)}</div><div class="hm" style="grid-template-columns:repeat(53,minmax(12px,1fr))">${months}</div><div class="hbody"><div class="hdn">${dn}</div><div class="hgrid">${cells}</div></div>
    <div class="hleg"><span>${esc(t.solvedYear(s.year))}</span><span class="lg"><svg class="legend-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v8m-3-3 3 3 3-3"/></svg>${esc(t.less)} <i class="hc l0"></i><i class="hc l1"></i><i class="hc l2"></i><i class="hc l3"></i><i class="hc l4"></i> ${esc(t.more)}<svg class="legend-arrow up" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 10V2m-3 3 3-3 3 3"/></svg></span></div></div></div>`;
  }
  // ---------- danh sách thư mục theo ngày
  function dayLabel(day) {
    const t = T(), d = new Date(day + 'T00:00:00'), td = new Date(); td.setHours(0, 0, 0, 0); const diff = Math.round((td - d) / 864e5);
    const full = d.toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), noWd = d.toLocaleDateString(LOC(), { day: 'numeric', month: 'long', year: 'numeric' }), cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    if (diff === 0) return [t.today, full]; if (diff === 1) return [t.yesterday, full]; if (diff > 1 && diff < 7) return [cap(d.toLocaleDateString(LOC(), { weekday: 'long' })), noWd]; return [d.toLocaleDateString(LOC(), { day: 'numeric', month: 'short', year: 'numeric' }), cap(d.toLocaleDateString(LOC(), { weekday: 'long' }))];
  }
  function card(i) {
    const t = T();
    const vds = (i.solved ? ['AC'] : []).concat(i.verdicts || []).map(v => `<span class="hs vd ${v}" title="${VTITLE[v]}">${v}</span>`).join('');
    const status = vds + (i.meta.pending ? `<span class="hs pend"><i class="spin"></i>${esc(t.aiNaming)}</span>` : !i.hasSol ? `<span class="hs red">${esc(t.noSolution)}</span>` : `${i.sols.filter(s => s.size > 0).map(s => `<span class="hs lang">${esc(extName(s.name))}</span>`).join('')}`);
    const rating = ratingDetails(i, t), details = [[i.meta.site, 'lang'], [difficultyName(i.meta.difficulty), 'diff']].filter(v => v[0]).map(([v, c]) => `<span class="hs ${c}">${esc(v)}</span>`).join('') + `<span class="hs ${rating.className}" title="${esc(rating.title)}">${esc(rating.label)}</span>`;
    return `<div class="hcard ${stOf(i) ? 'st-' + stOf(i) : ''} ${hs.sel === i.id ? 'on' : ''} ${isSelected('item', i.id) ? 'selected' : ''} ${isCut('item', i.id) ? 'cut' : ''}" data-hid="${esc(i.id)}" tabindex="0" draggable="true" data-hdrag="item"><div class="hct">${FOLDER}<span class="hright">${i.meta.star ? `<span class="hstar">${STAR}</span>` : ''}<button class="hdots" data-hmenu="${esc(i.id)}" aria-label="menu">${ICO.dots}</button></span></div>
    <div class="hname" title="${esc(i.name)}">${esc(i.name)}</div><div class="hmeta">${esc(t.files(i.count))} · ${esc(t.createdAt)} ${esc(hhmm(i.createdAt))}</div><div class="hrow">${status}${details}</div></div>`;
  }
  function groupCard(group, visibleItems) {
    const t = T(), children = groups.filter(g => g.parentId === group.id), items = visibleItems.filter(i => i.groupId === group.id);
    return `<section class="hfolder ${isCut('group', group.id) ? 'cut' : ''}" data-drop-group="${esc(group.id)}"><header class="hfolder-head ${isSelected('group', group.id) ? 'selected' : ''}" draggable="true" data-hdrag="group" data-hid="${esc(group.id)}" tabindex="0" aria-label="${esc(t.openFolder)} ${esc(group.name)}"><span>${ICO.folder}</span><b>${esc(group.name)}</b><span class="cnt">${items.length + children.length}</span><button class="hdots" data-gmenu="${esc(group.id)}" aria-label="${esc(t.folderActions)}">${ICO.dots}</button></header></section>`;
  }
  function cardsForGrid(items, includeFiltered = false) {
    const folders = groups.filter(group => (group.parentId || '') === hs.currentGroupId);
    const problems = items.filter(item => (item.groupId || '') === hs.currentGroupId);
    const query = hs.q.trim().toLowerCase();
    const entries = [
      ...folders.filter(group => includeFiltered || !query || group.name.toLowerCase().includes(query)).map(group => ({ key: `group:${group.id}`, kind: 'group', value: group })),
      ...problems.map(item => ({ key: `item:${item.id}`, kind: 'item', value: item }))
    ];
    const order = new Map((C.S.historyOrder || []).map((key, index) => [key, index]));
    return entries.sort((a, b) => {
      const ai = order.get(a.key), bi = order.get(b.key);
      if (ai === undefined && bi !== undefined) return -1;
      if (ai !== undefined && bi === undefined) return 1;
      if (ai !== undefined && bi !== undefined && ai !== bi) return ai - bi;
      const createdAt = entry => Number(entry.value.createdAt) || 0;
      const recent = createdAt(b) - createdAt(a);
      if (recent) return recent;
      return a.value.name.localeCompare(b.value.name, LOC(), { numeric: true, sensitivity: 'base' });
    });
  }
  function reorderCards(dragged, targetKey, after = false) {
    const kinds = new Set(dragged.map(entry => entry.kind));
    if (kinds.size !== 1 || (targetKey && targetKey.split(':', 1)[0] !== dragged[0].kind)) return;
    const keys = cardsForGrid(list, true).filter(entry => entry.kind === dragged[0].kind).map(entry => entry.key), moving = dragged.map(entry => `${entry.kind}:${entry.id}`).filter(key => keys.includes(key));
    if (!moving.length || (targetKey && moving.includes(targetKey))) return;
    const remaining = keys.filter(key => !moving.includes(key));
    let index = targetKey ? remaining.indexOf(targetKey) : remaining.length;
    if (index < 0) index = remaining.length;
    if (after && targetKey) index++;
    remaining.splice(index, 0, ...moving);
    const currentKeys = new Set(keys);
    C.S.historyOrder = (C.S.historyOrder || []).filter(key => !currentKeys.has(key)).concat(remaining); C.persist(); render();
  }
  async function exportSelected() {
    if (!hs.selected.length) return;
    const result = await api.inv('h-export-selection-zip', hs.selected.map(entry => entry.id));
    if (!result || result.canceled) return;
    if (result.error) return C.toast(result.error);
    C.toast(T().exportDone(result.count));
  }
  const TABLE_COLUMNS = ['name', 'result', 'judge', 'rating', 'created'];
  const DIFF_RANK = { Easy: 1, Medium: 2, Hard: 3 };
  function compareHistoryItems(a, b) {
    const score = i => (i.meta.rating || i.meta.ratingEstimate || 0) * 10 + (DIFF_RANK[i.meta.difficulty] || 0);
    const values = {
      name: [a.name, b.name],
      created: [a.createdAt, b.createdAt],
      judge: [`${a.meta.site} ${a.meta.pid}`, `${b.meta.site} ${b.meta.pid}`],
      rating: [score(a), score(b)],
      result: [a.solved ? 'AC' : (a.verdicts || []).join(' '), b.solved ? 'AC' : (b.verdicts || []).join(' ')]
    }[hs.sortKey] || [a.createdAt, b.createdAt];
    const result = typeof values[0] === 'number' && typeof values[1] === 'number'
      ? values[0] - values[1]
      : String(values[0]).localeCompare(String(values[1]), LOC(), { numeric: true, sensitivity: 'base' });
    return result * (hs.sortDir === 'asc' ? 1 : -1);
  }
  function tableHeader(t) {
    const labels = { name: t.historyColName, result: t.historyColResult, judge: t.historyColJudge, rating: t.historyColRating, created: t.historyColCreated };
    return `<thead><tr>${TABLE_COLUMNS.map(key => {
      const sorted = hs.sortKey === key, indicator = sorted ? (hs.sortDir === 'asc' ? ' ↑' : ' ↓') : '';
      return `<th class="hc-${key}"><button type="button" data-hsort="${key}" aria-sort="${sorted ? (hs.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}">${esc(labels[key])}<span>${indicator}</span></button></th>`;
    }).join('')}</tr></thead>`;
  }
  const relDay = ms => {                                             // Hôm nay 19:41 / Hôm qua 22:10 / 17/11/2026
    const t = T(), d = new Date(ms), n = new Date(), a = new Date(d.getFullYear(), d.getMonth(), d.getDate()), b = new Date(n.getFullYear(), n.getMonth(), n.getDate()), diff = Math.round((b - a) / 864e5);
    return diff === 0 ? `${t.today} ${hhmm(ms)}` : diff === 1 ? `${t.yesterday} ${hhmm(ms)}` : fmtDate(ms).slice(0, 10);
  };
  // ---------- Layout 2: nhóm theo ngày (giờ địa phương) như Windows File Explorer
  const DATE_BUCKETS = ['today', 'yesterday', 'week', 'month', 'older'];
  function dateBucket(ms, now = new Date()) {
    const startOfDay = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()), d = new Date(Number(ms) || 0);
    const diff = Math.round((startOfDay(now) - startOfDay(d)) / 864e5);        // theo ngày lịch, không bị lệch do DST
    if (diff <= 0) return 'today';
    if (diff === 1) return 'yesterday';
    const weekStart = startOfDay(now); weekStart.setDate(weekStart.getDate() - ((now.getDay() - (C.S.lang === 'en' ? 0 : 1) + 7) % 7));
    if (startOfDay(d) >= weekStart) return 'week';
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'month';
    return 'older';
  }
  function dateHeaderRow(key, label, count, collapsed) {
    return `<tr class="h-date-row"><td colspan="${TABLE_COLUMNS.length}"><button type="button" class="h-date-btn" data-hdate="${key}" aria-expanded="${!collapsed}"><svg class="chev ${collapsed ? 'c' : ''}" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg><b>${esc(label)}</b><span class="cnt">${count}</span></button></td></tr>`;
  }
  const folderPath = id => { const names = []; let g = groups.find(x => x.id === id), guard = 0; while (g && guard++ < 20) { names.unshift(g.name); const pid = g.parentId; g = groups.find(x => x.id === pid); } return names.join(' / '); };
  function tableItemRow(item, t, where) {
    const rating = item.meta.rating ? String(item.meta.rating) : item.meta.ratingEstimate ? `~${item.meta.ratingEstimate}` : difficultyName(item.meta.difficulty) || (item.meta.ratingStatus === 'unrated' ? t.unrated : item.meta.ratingEstimateStatus === 'pending' ? '…' : '—');
    const verdicts = (item.solved ? ['AC'] : []).concat(item.verdicts || []);
    const result = verdicts.length ? verdicts.map(v => `<span class="hs vd ${v}" title="${esc(VTITLE[v])}">${v}</span>`).join(' ') : item.meta.pending ? `<span class="hs pend"><i class="spin"></i></span>` : !item.hasSol ? `<span class="hs red">${esc(t.noSolution)}</span>` : '—';
    const site = item.meta.site || '—', page = item.meta.pid || item.meta.title || '';
    return `<tr class="h-table-item h-tree-item ${isSelected('item', item.id) ? 'selected' : ''} ${isCut('item', item.id) ? 'cut' : ''}" data-hid="${esc(item.id)}" data-hdrag="item" tabindex="0" draggable="true"><td class="hc-name"><div class="h-cell-name"><span class="h-tree-icon">${ROWICO}</span><b title="${esc(item.name)}">${esc(item.name)}</b>${where ? `<small class="h-where" title="${esc(where)}">${esc(where)}</small>` : ''}<button class="hdots" data-hmenu="${esc(item.id)}" aria-label="${esc(t.open)}">${ICO.dots}</button></div></td><td class="hc-result">${result}</td><td class="hc-judge"><span title="${esc(site)}">${esc(site)}</span>${page ? `<small title="${esc(page)}">${esc(page)}</small>` : ''}</td><td class="hc-rating" title="${esc(ratingDetails(item, t).title)}">${esc(rating)}</td><td class="hc-created" title="${esc(fmtDate(item.createdAt))}">${esc(relDay(item.createdAt))}</td></tr>`;
  }
  function tableFolderRow(group, count, t) {
    return `<tr class="h-table-folder h-tree-folder ${isSelected('group', group.id) ? 'selected' : ''} ${isCut('group', group.id) ? 'cut' : ''}" data-drop-group="${esc(group.id)}" data-hid="${esc(group.id)}" data-hdrag="group" tabindex="0" draggable="true"><td class="hc-name"><div class="h-cell-name"><span class="h-tree-icon">${ICO.folder}</span><b title="${esc(group.name)}">${esc(group.name)}</b><span class="h-tree-count">${count}</span><button class="hdots" data-gmenu="${esc(group.id)}" aria-label="${esc(t.folderActions)}">${ICO.dots}</button></div></td><td></td><td></td><td></td><td></td><td></td></tr>`;
  }
  function historyTable(visibleItems) {                              // danh sách phẳng của thư mục hiện tại: nhấp đúp thư mục để đi vào
    const t = T(), query = hs.q.trim().toLowerCase(), currentId = hs.currentGroupId || '';
    const folders = (query ? groups.filter(g => g.name.toLowerCase().includes(query)) : groups.filter(g => (g.parentId || '') === currentId));
    const items = query ? visibleItems : visibleItems.filter(i => (i.groupId || '') === currentId);
    const count = g => groups.filter(x => x.parentId === g.id).length + list.filter(i => i.groupId === g.id).length;
    const entries = [...folders.map(value => ({ kind: 'group', value })), ...items.map(value => ({ kind: 'item', value }))];
    const entriesCreatedAt = entry => Number(entry.value.createdAt) || 0;
    const entriesName = entry => entry.value.name || '';
    const direction = hs.sortDir === 'asc' ? 1 : -1;
    entries.sort((a, b) => {
      if (hs.sortKey === 'name') return entriesName(a).localeCompare(entriesName(b), LOC(), { numeric: true, sensitivity: 'base' }) * direction;
      if (hs.sortKey === 'created') return (entriesCreatedAt(a) - entriesCreatedAt(b)) * direction;
      if (a.kind === 'group' || b.kind === 'group') return (entriesCreatedAt(a) - entriesCreatedAt(b)) * -1;
      return compareHistoryItems(a.value, b.value);
    });
    const rowOf = entry => entry.kind === 'group' ? tableFolderRow(entry.value, count(entry.value), t) : tableItemRow(entry.value, t, query ? folderPath(entry.value.groupId) : '');
    const labels = { today: t.today, yesterday: t.yesterday, week: t.dateWeek, month: t.dateMonth, older: t.dateOlder };
    const buckets = Object.fromEntries(DATE_BUCKETS.map(k => [k, []])), now = new Date();
    for (const entry of entries) if (entry.kind === 'item') buckets[dateBucket(entry.value.createdAt, now)].push(entry);   // giữ nguyên thứ tự sắp xếp hiện tại trong từng nhóm
    const order = hs.sortKey === 'created' && hs.sortDir === 'asc' ? [...DATE_BUCKETS].reverse() : DATE_BUCKETS;
    const folderRows = entries.filter(entry => entry.kind === 'group').map(rowOf).join('');
    const sections = order.filter(k => buckets[k].length).map(k => { const collapsed = !!hs.dateCollapsed[k]; return dateHeaderRow(k, labels[k], buckets[k].length, collapsed) + (collapsed ? '' : buckets[k].map(rowOf).join('')); }).join('');
    const contents = folderRows + sections;
    if (!contents) return '';
    return `<div class="h-table-wrap"><table class="h-table">${tableHeader(t)}<tbody>${contents}</tbody></table></div>`;
  }
  function isCut(kind, id) { return folderClipboard.mode === 'cut' && folderClipboard.entries.some(entry => entry.kind === kind && entry.id === id); }
  function folderAncestors() {
    const chain = []; let current = groups.find(group => group.id === hs.currentGroupId);
    while (current) { chain.unshift(current); current = groups.find(group => group.id === current.parentId); }
    return chain;
  }
  function breadcrumbHtml() {
    const t = T(), ancestors = folderAncestors();
    return `<nav class="hbreadcrumb" aria-label="${esc(t.folderLocation)}"><button class="hback" data-nav-parent="${esc(ancestors.length > 1 ? ancestors[ancestors.length - 2].id : '')}" ${ancestors.length ? '' : 'disabled'} title="${esc(t.goBack)}">${SVG('<path d="M10.5 2.5L4.5 6.5l6 4"/>')}</button><button class="hcrumb" data-nav-id="" data-drop-parent="">${esc(t.folderHome)}</button>${ancestors.map((group, index) => `<span class="hcrumb-sep">›</span><button class="hcrumb ${index === ancestors.length - 1 ? 'current' : ''}" data-nav-id="${esc(group.id)}" data-drop-parent="${esc(group.parentId || '')}">${esc(group.name)}</button>${index === ancestors.length - 1 ? `<button class="hcrumb-add" data-create-parent="${esc(group.id)}" title="${esc(t.newSubGroup)}" aria-label="${esc(t.newSubGroup)}">${ICO.plus}</button>` : ''}`).join('')}</nav>`;
  }
  function render() {
    if (!built) return; const t = T(), items = filt(); $('#hstats').innerHTML = statsHtml();
    const gridEntries = cardsForGrid(items);
    const currentItems = gridEntries.filter(entry => entry.kind === 'item').map(entry => entry.value);
    const children = gridEntries.filter(entry => entry.kind === 'group').map(entry => entry.value);
    const days = hs.currentGroupId ? [] : [...new Set(currentItems.map(item => item.day))].sort().reverse();
    const dayHtml = days.map(day => {
      const dayItems = currentItems.filter(item => item.day === day), [label, subtitle] = dayLabel(day), collapsed = hs.collapsed[day];
      return `<div class="hgrp"><div class="hgh" data-hday="${day}"><svg class="chev ${collapsed ? 'c' : ''}" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg><b>${esc(label)}</b><span class="cnt">${dayItems.length}</span><span class="dsub">${esc(subtitle)}</span></div>${collapsed ? '' : `<div class="hgrid2">${dayItems.map(card).join('')}</div>`}</div>`;
    }).join('');
    const folders = children.length ? `<div class="hfolder-grid">${children.map(group => groupCard(group, items)).join('')}</div>` : '';
    const directProblems = hs.currentGroupId && currentItems.length ? `<div class="hgrid2">${currentItems.map(card).join('')}</div>` : dayHtml;
    const body = folders + directProblems;
    const folderModifier = /Mac/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl';
    const listMode = C.S.historyLayout === 'list' || C.S.historyLayout === 'tree', table = listMode ? historyTable(items) : '';
    const renderedBody = listMode ? table : body;
    $('#hfolder-list').innerHTML = breadcrumbHtml() + (renderedBody ? renderedBody : `<div class="empty" style="padding:36px 10px">${list.length || groups.length ? esc(t.none) : t.emptyHist(`<kbd>${esc(cfg.hotkey || '')}</kbd>`, folderModifier)}</div>`);
    const marquee = $('#hmarquee'); if (marquee) marquee.hidden = true;
  }
  // ---------- ngăn kéo chi tiết
  async function openDrawer(id, lang, keepScroll) {
    const i = byId(id); if (!i) return; hs.sel = id; const files = await api.inv('h-read', id); const code = files && !files.error ? files : { cpp: null, py: null };
    if (imageState.id !== id) imageState = { id, zoom: 1, x: 0, y: 0, fullscreen: false, drag: null, idx: 0, n: 0 };
    api.inv('h-active', id);
    const pref = C.S.codeLang === 'py' ? 'py' : 'cpp', has = k => code[k] != null && String(code[k]).trim();
    cur = { id, lang: lang || (has(pref) ? pref : has(pref === 'cpp' ? 'py' : 'cpp') ? (pref === 'cpp' ? 'py' : 'cpp') : pref), code, dirty: false };
    const d = $('#hdrawer'); d.hidden = false; d.innerHTML = `<div class="hd-in"><div class="hd-head" id="hdHead"></div><div class="hd-cols"><section class="hd-img" id="hdImg"></section><section class="hd-right"><div class="hd-sol" id="hdSol"></div></div></section></div></div>`;
    drawerHead(i); drawerImg(i); drawerSol(); render();
  }
  function closeDrawer() { flush(); cur = null; hs.sel = ''; api.inv('h-active', ''); imageState.fullscreen = false; imageState.drag = null; const d = $('#hdrawer'); if (d) { d.hidden = true; d.innerHTML = ''; } if (active) render(); }
  function drawerHead(i) {
    const t = T(), e = $('#hdHead'); if (!e) return; const sub = [i.meta.site, i.meta.pid, difficultyName(i.meta.difficulty), ratingDetails(i, t).label, i.day].filter(Boolean).join(' · ');
    e.innerHTML = `<div class="hd-title"><b>${esc(i.name)}</b><span>${esc(sub)}</span></div><div class="hd-acts"><span class="vts">${TAGS.map(v => { const on = v === 'AC' ? !!i.solved : (i.verdicts || []).includes(v); return `<button class="vt ${v} ${on ? 'on' : ''}" data-hverdict="${v}" title="${VTITLE[v]}" aria-pressed="${on}">${v}</button>`; }).join('')}</span><button class="hb ${i.meta.star ? 'starred' : ''}" data-hact="star" title="${esc(i.meta.star ? t.unstar : t.star)}">${STAR}</button><button class="hb ic" data-hact="rename" title="${esc(t.rename)} (${esc(C.keyLabel('rename'))})" aria-label="${esc(t.rename)}"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8.6 2.2l2.2 2.2M1.9 11.1l.6-2.5 6.7-6.7 1.9 1.9-6.7 6.7z"/></svg></button><button class="hb ic" data-hact="reveal" title="${esc(t.reveal)}" aria-label="${esc(t.reveal)}">${ICO.folder}</button><button class="hb" data-hmenu="${esc(i.id)}">${ICO.dots}</button><button class="hb" data-hact="closedr" aria-label="close">${ICO.x}</button></div>`;
  }
  function drawerImg(i) {
    const e = $('#hdImg'); if (!e) return; const t = T(), imgs = i.imgs || [];
    if (imgs.length > (imageState.n || 0) && imageState.n > 0) { imageState.idx = imgs.length - 1; imageState.zoom = 1; imageState.x = 0; imageState.y = 0; }   // vừa thêm ảnh mới -> nhảy tới ảnh đó
    imageState.n = imgs.length; if (imageState.idx >= imgs.length) imageState.idx = Math.max(0, imgs.length - 1);
    if (!imgs.length) { imageState.fullscreen = false; e.classList.remove('fullscreen'); e.innerHTML = `<div class="empty"><div>${esc(t.noImg)}</div><button class="hb himg-add" data-image-act="add">${IMGICO.plus}<span>${esc(t.addImg)}</span></button></div>`; return; }
    const m = imgs[imageState.idx], n = imgs.length, k = imageState.idx, b = (a, title, ico) => `<button class="hb ic" data-image-act="${a}" title="${esc(title)}" aria-label="${esc(title)}">${ico}</button>`;
    const nav = n > 1 ? `<button class="himg-nav prev" data-image-nav="-1" title="${esc(t.prevImg)} ( &lt; )" aria-label="${esc(t.prevImg)}" ${k === 0 ? 'disabled' : ''}>${IMGICO.chev('M10 3L5 8l5 5')}</button><button class="himg-nav next" data-image-nav="1" title="${esc(t.nextImg)} ( &gt; )" aria-label="${esc(t.nextImg)}" ${k === n - 1 ? 'disabled' : ''}>${IMGICO.chev('M6 3l5 5-5 5')}</button>` : '';
    e.innerHTML = `<div class="himg-tools">${b('out', t.zoomOut, IMGICO.zoomOut)}${b('in', t.zoomIn, IMGICO.zoomIn)}${b('reset', t.resetZoom, IMGICO.reset)}<span class="image-zoom">${Math.round(imageState.zoom * 100)}%</span><span class="sp"></span>${n > 1 ? `<span class="hpn">${k + 1} / ${n}</span>` : ''}${b('rot', t.rotImg, IMGICO.rot)}${b('add', `${t.addImg} (${C.keyLabel('paste') || 'Ctrl+V'})`, IMGICO.plus)}${b('del', t.delImg, IMGICO.trash)}${b('full', imageState.fullscreen ? t.exitFullScreen : t.fullScreen, imageState.fullscreen ? IMGICO.exitFull : IMGICO.full)}</div><div class="hpimg-wrap"><img class="hpimg" src="${esc(m.url)}" alt="" draggable="false"></div>${nav}`;
    const im = e.querySelector('.hpimg'); im.addEventListener('load', updateImageView); updateImageView();
  }
  function navImage(d) { const i = cur && byId(cur.id); if (!i || !i.imgs) return; const k = imageState.idx + d; if (k < 0 || k >= i.imgs.length) return; imageState.idx = k; imageState.zoom = 1; imageState.x = 0; imageState.y = 0; drawerImg(i); }
  function rotateImage(dir) {
    const i = cur && byId(cur.id), m = i && (i.imgs || [])[imageState.idx]; if (!m) return;
    m.rot = (((m.rot || 0) + 90 * dir) % 360 + 360) % 360; updateImageView();
    const map = {}; i.imgs.forEach(x => { if (x.rot) map[x.name] = x.rot; }); api.inv('h-meta', i.id, { imgRot: map });      // lưu góc xoay theo từng ảnh
  }
  function updateImageView() {
    const box = $('#hdImg'), img = box && box.querySelector('.hpimg'); if (!img) return;
    box.classList.toggle('fullscreen', imageState.fullscreen);
    const wrap = box.querySelector('.hpimg-wrap'); if (wrap) wrap.classList.toggle('zoomed', imageState.zoom > 1);
    const ci = cur && byId(cur.id), cm = ci && (ci.imgs || [])[imageState.idx], rot = cm ? (cm.rot || 0) : 0;
    if (rot % 180 && wrap && img.naturalWidth) {                                       // ảnh xoay ngang: co lại cho vừa khung
      const W = Math.max(40, Math.min(wrap.clientWidth * img.naturalWidth / img.naturalHeight, wrap.clientHeight));
      img.style.maxWidth = 'none'; img.style.maxHeight = 'none'; img.style.height = 'auto'; img.style.width = W + 'px';
    } else { img.style.maxWidth = ''; img.style.maxHeight = ''; img.style.width = ''; img.style.height = ''; }
    clampImagePan(rot);
    img.style.transform = `translate(${imageState.x}px, ${imageState.y}px) scale(${imageState.zoom}) rotate(${rot}deg)`;
    const label = box.querySelector('.image-zoom'); if (label) label.textContent = `${Math.round(imageState.zoom * 100)}%`;
    const full = box.querySelector('[data-image-act="full"]'); if (full) {
      const text = imageState.fullscreen ? T().exitFullScreen : T().fullScreen;
      full.title = text; full.setAttribute('aria-label', text); full.innerHTML = imageState.fullscreen ? IMGICO.exitFull : IMGICO.full;
    }
  }
  window.addEventListener('resize', () => { if (cur) updateImageView(); });
  function zoomImage(delta) { imageState.zoom = Math.max(0.5, Math.min(5, +(imageState.zoom + delta).toFixed(2))); updateImageView(); }
  function drawerSol() {
    if (solRenderCancel) solRenderCancel(); solRenderCancel = null;
    const e = $('#hdSol'); if (!e || !cur) return; const t = T(), i = byId(cur.id), c = cur.code, has = k => c[k] != null && String(c[k]).trim(), v = c[cur.lang] || '';
    const n = lineCount(v);
    e.innerHTML = `<div class="hsol-h"><b>${esc(t.solution)}</b><span class="seg2"><button data-hlang="cpp" class="${cur.lang === 'cpp' ? 'on' : ''}">C++${has('cpp') ? ' •' : ''}</button><button data-hlang="py" class="${cur.lang === 'py' ? 'on' : ''}">Python${has('py') ? ' •' : ''}</button></span><span class="sp"></span>${i && !i.hasSol && !has(cur.lang) ? `<span class="hs red">${esc(t.noSolution)}</span>` : ''}</div>
    <div class="hed"><div id="hlines" class="gut">${lineNumbers(n)}</div><div class="hcode"><pre id="hhl" class="hhl" aria-hidden="true"><code class="hljs">${highlightedCode(v, cur.lang)}</code></pre><textarea id="hta" class="hta" aria-label="${esc(t.solution)}" spellcheck="false" wrap="off" autocomplete="off" placeholder="${esc(cur.lang === 'py' ? '# …' : '// …')}">${esc(v)}</textarea></div></div>`;
  }
  async function flush() { if (!cur || !cur.dirty) return; clearTimeout(saveT); cur.dirty = false; const r = await api.inv('h-write', cur.id, cur.lang, cur.code[cur.lang] || ''); if (r && r.error) C.toast(T().saveFail + ': ' + r.error); }
  // ---------- hành động
  async function importSolution(id) {
    const i = byId(id); if (!i) return; const r = await api.inv('h-pick-solution', id);
    if (!r || r.canceled) return; if (r.error) return C.toast(r.error);
    const files = await api.inv('h-read', id), old = files && !files.error ? files[r.ext] : null;
    if (old != null && String(old).trim() && !confirm(T().replaceSol(r.ext === 'py' ? 'Python' : 'C++'))) return;
    const w = await api.inv('h-write', id, r.ext, r.text); if (w && w.error) return C.toast(w.error);
    C.toast(T().solImported(r.name)); await load(); openDrawer(id, r.ext);
  }
  function addImageMenu(btn) {
    if (!cur) return; const id = cur.id, r = btn.getBoundingClientRect(), t = T();
    C.menu(r.left, r.bottom + 4, [{ label: t.addRegion, run: () => addImage(id, 'region') }, { label: t.addFile, run: () => addImage(id, 'file') }]);
  }
  async function addImage(id, kind) {
    const r = await api.inv('h-add-image', id, kind); if (!r) return; if (r.error) return C.toast(r.error);
    if (r.added) { C.toast(T().imgAddedN(r.added)); await load(); }
  }
  async function deleteImage() {
    const i = cur && byId(cur.id), m = i && (i.imgs || [])[imageState.idx]; if (!m || !confirm(T().delImgConfirm(m.name))) return;
    imageState.n = Math.max(0, i.imgs.length - 1); imageState.idx = Math.max(0, imageState.idx - 1);
    const r = await api.inv('h-del-image', i.id, m.name); if (r && r.error) return C.toast(r.error); await load();
  }
  function showLink(id) {
    const i = byId(id); if (!i) return; const t = T(); const old = document.querySelector('.askwrap'); if (old) old.remove();
    const w = document.createElement('div'); w.className = 'askwrap';
    w.innerHTML = `<div class="mask"></div><div class="dlg askd linkd"><h2>${esc(t.linkLbl)}</h2><div class="linkrow"><input id="linkIn" value="${esc(i.meta.url || '')}" placeholder="https://…" spellcheck="false" autocomplete="off"><button class="hb ic" data-la="copy" title="${esc(t.copyUrl)}" aria-label="${esc(t.copyUrl)}">${IMGICO.copy}</button><button class="hb ic" data-la="open" title="${esc(t.openLink)}" aria-label="${esc(t.openLink)}">${IMGICO.ext}</button></div><p class="hint linksrc" id="linkSrc" hidden></p><p class="hint err" id="linkHint" hidden></p></div>`;
    document.body.appendChild(w); const inp = w.querySelector('#linkIn'), hint = w.querySelector('#linkHint'), srcEl = w.querySelector('#linkSrc'); inp.focus(); inp.select(); let saved = i.meta.url || '';
    const showSrc = () => { const k = i.meta.url && i.meta.urlSource, name = k && t['linkSrc' + k[0].toUpperCase() + k.slice(1)]; srcEl.textContent = name ? `${t.linkSrc}: ${name}` : ''; srcEl.hidden = !name; };   // nguồn: ảnh / API Codeforces / Google Search / nhập tay
    showSrc();
    const save = async () => {                                                      // sửa trực tiếp trong ô, tự lưu khi Enter / bấm ra ngoài
      const v = inp.value.trim(); if (v === saved) return true;
      if (v !== '' && !/^https?:\/\/\S+$/i.test(v)) { inp.classList.add('bad'); hint.textContent = t.linkBad; hint.hidden = false; return false; }
      inp.classList.remove('bad'); const r = await api.inv('h-meta', id, { url: v }); if (r && r.error) { C.toast(r.error); return false; }
      saved = v; i.meta.url = v; i.meta.urlSource = v ? 'manual' : ''; showSrc(); load(); return true;
    };
    const close = async () => { if (await save()) w.remove(); };
    w.addEventListener('click', async e => {
      if (e.target.classList.contains('mask')) return close(); const b = e.target.closest('[data-la]'); if (!b) return;
      if (!(await save())) return; if (b.dataset.la === 'copy') { const r = await api.inv('h-copy-url', id); if (r && r.error) return C.toast(r.error); C.toast(t.copiedUrl); }
      else if (saved) api.openExt(saved);
    });
    inp.addEventListener('input', () => { inp.classList.remove('bad'); hint.hidden = true; });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); close(); } if (e.key === 'Escape') { e.stopPropagation(); w.remove(); } });
  }
  function syncTagButtons(i) {                                       // đổi trạng thái nút tại chỗ: không hiệu ứng, không vẽ lại
    if (!cur || cur.id !== i.id) return;
    document.querySelectorAll('#hdHead [data-hverdict]').forEach(b => { const v = b.dataset.hverdict, on = v === 'AC' ? !!i.solved : (i.verdicts || []).includes(v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  }
  async function toggleVerdict(id, v) {
    const i = byId(id); if (!i || !VERDICTS.includes(v)) return; const set = new Set(i.verdicts || []); set.has(v) ? set.delete(v) : set.add(v);
    i.verdicts = VERDICTS.filter(x => set.has(x)); render(); syncTagButtons(i);
    await api.inv('h-meta', id, { verdicts: i.verdicts });
  }
  async function toggleSolved(id) {
    const i = byId(id); if (!i) return; const next = !i.solved, at = next ? Date.now() : 0;
    i.solved = next; i.solvedAt = at; render(); syncTagButtons(i);      // cập nhật ngay, không hiệu ứng
    await api.inv('h-meta', id, { solved: next, solvedAt: at });
  }
  async function toggleStar(id) { const i = byId(id); if (!i) return; await api.inv('h-meta', id, { star: !i.meta.star }); load(); }
  async function rename(id) { const i = byId(id); if (!i) return; const n = await C.ask(T().renamePrompt, i.name); if (!n || n === i.name) return; const r = await api.inv('h-rename', id, n); if (r && r.error) return C.toast(r.error); if (cur && cur.id === id) cur.id = r; if (hs.sel === id) hs.sel = r; await load(); }
  async function del(id) { const i = byId(id); if (!i || !confirm(T().delHistConfirm(i.name))) return; if (cur && cur.id === id) { cur.dirty = false; closeDrawer(); } await api.inv('h-delete', id); load(); }
  async function addSol(id, ext) { const f = await api.inv('h-read', id); if (!f || f[ext] == null) await api.inv('h-write', id, ext, ''); await load(); await openDrawer(id, ext); const ta = $('#hta'); if (ta) ta.focus(); }
  async function create() { const id = await api.inv('h-new', T().newProblemTitle, hs.currentGroupId || null); if (id && id.error) return C.toast(id.error); if (C.st.view !== 'history') C.setView('history'); await load(); openDrawer(id); }
  async function pathCopy(id) { const p = await api.inv('h-path', id); if (typeof p === 'string') navigator.clipboard.writeText(p).then(() => C.toast(T().copiedPath)); }
  async function copyUrl(id) { const r = await api.inv('h-copy-url', id); if (r && r.error) return C.toast(r.error); C.toast(T().copiedUrl); }
  async function refreshMetadata(id) { const r = await api.inv('ai-refresh', id); if (r && r.error) C.toast(r.error === 'NO_KEY' ? T().noKey : r.error); await load(); }
  async function newGroup(parentId = hs.currentGroupId) { const name = await C.ask(T().newGroupPrompt); if (!name) return; const r = await api.inv('h-new-group', name, parentId || null); if (r && r.error) return C.toast(r.error); await load(); }
  async function renameGroup(id) { const group = groups.find(g => g.id === id); if (!group) return; const name = await C.ask(T().renamePrompt, group.name); if (!name || name === group.name) return; const r = await api.inv('h-rename', id, name); if (r && r.error) return C.toast(r.error); await load(); }
  async function moveEntries(entries, parentId) {
    const ids = entries.map(entry => entry.id), r = await api.inv('h-move-many', ids, parentId || null);
    if (r && r.error) return C.toast(r.error);
    C.toast(T().movedSelected(ids.length)); hs.selected = []; hs.anchor = null; await load(); if (active) renderBar();
  }
  async function pasteEntries(parentId = hs.currentGroupId) {
    if (!folderClipboard.entries.length) return;
    const entries = folderClipboard.entries.slice(), mode = folderClipboard.mode;
    const r = mode === 'cut'
      ? await api.inv('h-move-many', entries.map(entry => entry.id), parentId || null)
      : await api.inv('h-copy-many', entries.map(entry => entry.id), parentId || null);
    if (r && r.error) return C.toast(r.error);
    if (mode === 'cut') folderClipboard = { mode: '', entries: [] };
    hs.selected = []; hs.anchor = null; await load(); if (active) renderBar();
    C.toast(mode === 'cut' ? T().movedSelected(entries.length) : T().copiedSelected(entries.length));
  }
  function setClipboard(mode, entries = hs.selected) {
    if (!entries.length) return;
    folderClipboard = { mode, entries: entries.map(entry => ({ id: entry.id, kind: entry.kind })) };
    hs.selected = entries.slice(); renderBar(); render();
  }
  async function deleteSelected() {
    if (!hs.selected.length || !confirm(T().deleteSelectedConfirm(hs.selected.length))) return;
    const ids = hs.selected.map(entry => entry.id), r = await api.inv('h-delete-many', ids);
    if (r && r.error) C.toast(r.error); else C.toast(T().deletedSelected(ids.length));
    if (cur && ids.some(id => cur.id === id || cur.id.startsWith(id + '/'))) { cur.dirty = false; closeDrawer(); }
    hs.selected = []; hs.anchor = null; await load(); if (active) renderBar();
  }
  function groupMenu(id, x, y) {
    const t = T(), group = groups.find(g => g.id === id); if (!group) return;
    if (!isSelected('group', id)) setSelection([{ id, kind: 'group' }], { id, kind: 'group' });
    const entries = hs.selected.slice();
    C.menu(x, y, [{ label: t.openFolder, run: () => navigateTo(id) }, { label: t.newSubGroup, run: () => newGroup(id) }, { sep: 1 },
      { label: t.exportSelectionZip, run: exportSelected }, { sep: 1 },
      { label: t.cutSelected, keys: C.keyLabel('cut'), run: () => setClipboard('cut', entries) }, { label: t.copySelected, keys: C.keyLabel('copy'), run: () => setClipboard('copy', entries) },
      { label: t.pasteSelected, keys: C.keyLabel('paste'), off: !folderClipboard.entries.length, run: () => pasteEntries(id) },
      { label: t.rename, run: () => renameGroup(id) }, { sep: 1 }, { label: t.deleteSelected, keys: C.keyLabel('del'), danger: 1, run: deleteSelected }]);
  }
  function cardMenu(id, x, y) {
    const t = T(), i = byId(id); if (!i) return;
    if (!isSelected('item', id)) setSelection([{ id, kind: 'item' }], { id, kind: 'item' });
    const entries = hs.selected.slice();
    C.menu(x, y, [{ label: t.openSol, run: () => importSolution(id) }, { label: i.solved ? t.unmarkSolved : t.markSolved, run: () => toggleSolved(id) }, { label: t.exportSelectionZip, run: exportSelected }, { sep: 1 }, { label: t.cutSelected, keys: C.keyLabel('cut'), run: () => setClipboard('cut', entries) }, { label: t.copySelected, keys: C.keyLabel('copy'), run: () => setClipboard('copy', entries) },
      { label: t.pasteSelected, keys: C.keyLabel('paste'), off: !folderClipboard.entries.length, run: () => pasteEntries() }, { label: t.rename, keys: C.keyLabel('rename'), run: () => rename(id) }, { sep: 1 },
      { label: t.refreshMetadata, off: !i.img && !i.hasSol, run: () => refreshMetadata(id) }, { label: t.linkLbl, run: () => showLink(id) }, { sep: 1 },
      { label: t.reveal, run: () => api.inv('h-open', id) }, { label: t.copyPath, run: () => pathCopy(id) }, { sep: 1 }, { label: t.deleteSelected, danger: 1, keys: C.keyLabel('del'), run: deleteSelected }]);
  }
  function selectEntry(entry, e) {
    const key = entryKey(entry), visible = selectableEntries();
    if (e.shiftKey && hs.anchor) {
      const start = visible.findIndex(item => entryKey(item) === hs.anchor), end = visible.findIndex(item => entryKey(item) === key);
      if (start >= 0 && end >= 0) return setSelection(visible.slice(Math.min(start, end), Math.max(start, end) + 1), entry);
    }
    const next = new Map(hs.selected.map(item => [entryKey(item), item]));
    if (e.ctrlKey || e.metaKey) {
      if (next.has(key)) next.delete(key); else next.set(key, entry);
      if (!hs.anchor) hs.anchor = key;
      hs.selected = [...next.values()]; updateSelection(); return;
    }
    setSelection([entry], entry);
  }
  function onSelectionDown(e) {
    const container = $('#hgroups');
    if (!active || e.button !== 0 || !container || !container.contains(e.target) ||
        e.target.closest('[data-hdrag],.hgh,button,input,select,textarea,.hbreadcrumb')) return;
    const rect = container.getBoundingClientRect(), x = e.clientX - rect.left + container.scrollLeft, y = e.clientY - rect.top + container.scrollTop;
    hs.marquee = { pointerId: e.pointerId, x, y, x2: x, y2: y, moved: false,
      preserve: e.ctrlKey || e.metaKey || e.shiftKey ? hs.selected.slice() : [] };
    container.setPointerCapture(e.pointerId);
    const marquee = $('#hmarquee'); marquee.hidden = false; marquee.style.left = `${x}px`; marquee.style.top = `${y}px`;
    marquee.style.width = '0px'; marquee.style.height = '0px'; e.preventDefault();
  }
  function onSelectionMove(e) {
    const drag = hs.marquee, container = $('#hgroups'); if (!drag || drag.pointerId !== e.pointerId || !container) return;
    const rect = container.getBoundingClientRect();
    drag.x2 = e.clientX - rect.left + container.scrollLeft; drag.y2 = e.clientY - rect.top + container.scrollTop;
    if (Math.abs(drag.x2 - drag.x) + Math.abs(drag.y2 - drag.y) < 4) return;
    drag.moved = true;
    const bounds = { left: Math.min(drag.x, drag.x2), right: Math.max(drag.x, drag.x2), top: Math.min(drag.y, drag.y2), bottom: Math.max(drag.y, drag.y2) };
    const marquee = $('#hmarquee');
    marquee.style.left = `${bounds.left}px`; marquee.style.top = `${bounds.top}px`;
    marquee.style.width = `${bounds.right - bounds.left}px`; marquee.style.height = `${bounds.bottom - bounds.top}px`;
    const selected = new Set(drag.preserve.map(entryKey));
    for (const entry of selectableEntries()) {
      const box = entry.node.getBoundingClientRect(), left = box.left - rect.left + container.scrollLeft, right = box.right - rect.left + container.scrollLeft, top = box.top - rect.top + container.scrollTop, bottom = box.bottom - rect.top + container.scrollTop;
      if (left <= bounds.right && right >= bounds.left && top <= bounds.bottom && bottom >= bounds.top) selected.add(entryKey(entry));
      entry.node.classList.toggle('selected', selected.has(entryKey(entry)));
    }
  }
  function onSelectionUp(e) {
    const drag = hs.marquee, container = $('#hgroups'); if (!drag || e.pointerId !== drag.pointerId || !container) return;
    onSelectionMove(e);
    hs.marquee = null; const marquee = $('#hmarquee'); if (marquee) marquee.hidden = true;
    if (!drag.moved) {
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && hs.selected.length) { hs.selected = []; hs.anchor = null; updateSelection(); }
      return;
    }
    const bounds = { left: Math.min(drag.x, drag.x2), right: Math.max(drag.x, drag.x2), top: Math.min(drag.y, drag.y2), bottom: Math.max(drag.y, drag.y2) }, rect = container.getBoundingClientRect();
    const selected = drag.preserve.slice();
    for (const entry of selectableEntries()) {
      const box = entry.node.getBoundingClientRect(), left = box.left - rect.left + container.scrollLeft, right = box.right - rect.left + container.scrollLeft, top = box.top - rect.top + container.scrollTop, bottom = box.bottom - rect.top + container.scrollTop;
      if (left <= bounds.right && right >= bounds.left && top <= bounds.bottom && bottom >= bounds.top) selected.push(entry);
    }
    setSelection(selected, selected[selected.length - 1]);
  }
  // ---------- sự kiện
  function onClick(e) {
    const g = s => e.target.closest(s); if (!g('#hview')) return; let x;
    if ((x = g('[data-hdate]'))) { hs.dateCollapsed[x.dataset.hdate] = !hs.dateCollapsed[x.dataset.hdate]; render(); return; }
    if ((x = g('[data-hlayout]'))) { C.S.historyLayout = x.dataset.hlayout === 'list' ? 'list' : 'cards'; C.persist(); renderBar(); render(); return; }
    if ((x = g('[data-hsort]'))) { const key = x.dataset.hsort; if (!TABLE_COLUMNS.includes(key)) return; hs.sortDir = hs.sortKey === key ? (hs.sortDir === 'asc' ? 'desc' : 'asc') : (key === 'created' || key === 'rating' || key === 'files' ? 'desc' : 'asc'); hs.sortKey = key; return render(); }
    if ((x = g('[data-create-parent]'))) { e.preventDefault(); e.stopPropagation(); return newGroup(x.dataset.createParent || null); }
    if ((x = g('[data-nav-id]'))) { e.preventDefault(); return navigateTo(x.dataset.navId); }
    if ((x = g('[data-nav-parent]'))) { e.preventDefault(); return navigateTo(x.dataset.navParent); }
    if ((x = g('[data-hverdict]'))) { e.preventDefault(); e.stopPropagation(); const vid = cur ? cur.id : hs.sel; return x.dataset.hverdict === 'AC' ? toggleSolved(vid) : toggleVerdict(vid, x.dataset.hverdict); }
    if ((x = g('[data-gmenu]'))) { e.stopPropagation(); const r = x.getBoundingClientRect(); return groupMenu(x.dataset.gmenu, r.left, r.bottom + 2); }
    if ((x = g('[data-hmenu]'))) { e.stopPropagation(); const r = x.getBoundingClientRect(); return cardMenu(x.dataset.hmenu, r.left, r.bottom + 2); }
    if ((x = g('[data-hact]'))) { const a = x.dataset.hact, id = cur ? cur.id : hs.sel; if (a === 'new') return create(); if (a === 'root') return api.inv('h-open'); if (a === 'stats') { hs.statsOpen = !hs.statsOpen; return render(); }
      if (a === 'newgroup') return newGroup(); if (a === 'help') return C.showHistoryHelp();
      if (a === 'closedr') return closeDrawer(); if (a === 'solve') return toggleSolved(id); if (a === 'star') return toggleStar(id); if (a === 'rename') return rename(id); if (a === 'reveal') return api.inv('h-open', id); }
    if ((x = g('[data-hdrag]'))) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) { e.preventDefault(); e.stopPropagation(); return selectEntry({ id: x.dataset.hid, kind: x.dataset.hdrag }, e); }
      {
        e.preventDefault(); e.stopPropagation(); hs.sel = '';
        const entry = { id: x.dataset.hid, kind: x.dataset.hdrag }; hs.selected = [entry]; hs.anchor = entryKey(entry);
        document.querySelectorAll('#hgroups [data-hdrag]').forEach(node => node.classList.toggle('selected', node === x));
        renderBar(); return;
      }
    }
    if ((x = g('[data-image-act]'))) { const a = x.dataset.imageAct;
      if (a === 'in') return zoomImage(.2); if (a === 'out') return zoomImage(-.2);
      if (a === 'reset') { imageState.zoom = 1; imageState.x = 0; imageState.y = 0; return updateImageView(); }
      if (a === 'full') { imageState.fullscreen = !imageState.fullscreen; return updateImageView(); }
      if (a === 'add') return addImageMenu(x); if (a === 'del') return deleteImage(); if (a === 'rot') return rotateImage(e.shiftKey ? -1 : 1); }
    if ((x = g('[data-image-nav]'))) return navImage(+x.dataset.imageNav);
    if ((x = g('[data-hlang]'))) { flush().then(() => { cur.lang = x.dataset.hlang; C.S.codeLang = cur.lang; drawerSol(); }); return; }
    if ((x = g('[data-hday]'))) { hs.collapsed[x.dataset.hday] = !hs.collapsed[x.dataset.hday]; return render(); }
  }
  function onDoubleClick(e) {
    if (!$('#hview').contains(e.target)) return;
    const header = e.target.closest('.hfolder-head,.h-tree-folder'); if (header) { e.preventDefault(); return navigateTo(header.dataset.hid); }
    const card = e.target.closest('.hcard,.h-tree-item'); if (card && !e.target.closest('button')) { e.preventDefault(); hs.selected = []; hs.anchor = null; renderBar(); openDrawer(card.dataset.hid); }
  }
  function onCtx(e) {
    if (!e.target.closest('#hview') || e.target.closest('#hta')) return; e.preventDefault(); const t = T(); let x;
    if ((x = e.target.closest('.hfolder-head,.h-tree-folder'))) {
      if (!isSelected('group', x.dataset.hid)) setSelection([{ id: x.dataset.hid, kind: 'group' }], { id: x.dataset.hid, kind: 'group' });
      return groupMenu(x.dataset.hid, e.clientX, e.clientY);
    }
    if ((x = e.target.closest('.hcard,.h-tree-item'))) {
      if (!isSelected('item', x.dataset.hid)) setSelection([{ id: x.dataset.hid, kind: 'item' }], { id: x.dataset.hid, kind: 'item' });
      return cardMenu(x.dataset.hid, e.clientX, e.clientY);
    }
    if ((x = e.target.closest('[data-drop-parent]'))) return C.menu(e.clientX, e.clientY, [{ label: t.pasteSelected, keys: C.keyLabel('paste'), off: !folderClipboard.entries.length, run: () => pasteEntries(x.dataset.dropParent) }]);
    if ((x = e.target.closest('.hpimg')) && cur) {
      const i = byId(cur.id), m = i && (i.imgs || [])[imageState.idx];
      if (!m) return;
      return C.menu(e.clientX, e.clientY, [{ label: t.copyImg, run: () => api.inv('h-copyimg', cur.id, m.name).then(r => { if (r && r.error) C.toast(r.error); else C.toast(t.copied); }) }, { label: t.openImg, run: () => api.inv('h-open', cur.id) }]);
    }
    if (e.target.closest('#hgroups')) {
      const selected = hs.selected.slice();
      return C.menu(e.clientX, e.clientY, [{ label: t.newGroup, run: () => newGroup() }, { label: t.newItem, keys: C.keyLabel('new'), run: create }, { label: t.exportSelectionZip, off: !selected.length, run: exportSelected }, { sep: 1 },
        { label: t.cutSelected, keys: C.keyLabel('cut'), off: !selected.length, run: () => setClipboard('cut', selected) }, { label: t.copySelected, keys: C.keyLabel('copy'), off: !selected.length, run: () => setClipboard('copy', selected) },
        { label: t.pasteSelected, keys: C.keyLabel('paste'), off: !folderClipboard.entries.length, run: () => pasteEntries() },
        { label: t.deleteSelected, keys: C.keyLabel('del'), off: !selected.length, danger: 1, run: deleteSelected }]);
    }
    if (e.target.closest('#hmain')) return C.menu(e.clientX, e.clientY, [{ label: t.newItem, keys: C.keyLabel('new'), run: create }, { label: t.newGroup, run: () => newGroup() }, { label: t.openRoot, run: () => api.inv('h-open') }]);
  }
  function onDragStart(e) {
    const source = e.target.closest('[data-hdrag]'); if (!source) return;
    if (e.target.closest('button')) { e.preventDefault(); return; }
    const entry = { id: source.dataset.hid, kind: source.dataset.hdrag };
    dragSource = isSelected(entry.kind, entry.id) ? hs.selected.slice() : [entry];
    if (!isSelected(entry.kind, entry.id)) { hs.selected = [entry]; hs.anchor = entryKey(entry); }
    document.querySelectorAll('#hgroups [data-hdrag]').forEach(node => node.classList.toggle('selected', dragSource.some(item => item.id === node.dataset.hid && item.kind === node.dataset.hdrag)));
    renderBar();
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragSource.map(item => item.id).join('\n'));
  }
  function onDragOver(e) {
    if (!dragSource) return;
    const target = e.target.closest('[data-drop-group]');
    const breadcrumb = e.target.closest('[data-drop-parent]');
    if (target) { e.preventDefault(); target.classList.add('drop-target'); }
    else if (e.target.closest('.hgrid2') && e.target.closest('.hcard')) { e.preventDefault(); e.target.closest('.hcard').classList.add('drop-target'); }
    else if (breadcrumb) { e.preventDefault(); breadcrumb.classList.add('drop-target'); }
    else if (e.target.closest('#hgroups')) e.preventDefault();
  }
  function onDragLeave(e) {
    for (const selector of ['[data-drop-group]', '[data-drop-parent]', '.hcard']) {
      const target = e.target.closest(selector);
      if (target && !target.contains(e.relatedTarget)) target.classList.remove('drop-target');
    }
  }
  function onDrop(e) {
    if (!dragSource) return;
    const target = e.target.closest('[data-drop-group]'), targetEntry = e.target.closest('[data-hdrag]'), breadcrumb = e.target.closest('[data-drop-parent]'), entries = dragSource.slice(); dragSource = null;
    document.querySelectorAll('.hfolder.drop-target,.h-tree-node.drop-target,.h-table-folder.drop-target,.hcard.drop-target').forEach(el => el.classList.remove('drop-target'));
    document.querySelectorAll('.hcrumb.drop-target').forEach(el => el.classList.remove('drop-target'));
    const cardGrid = C.S.historyLayout !== 'list' && C.S.historyLayout !== 'tree' && !!e.target.closest('.hfolder-grid,.hgrid2');
    const cardSection = e.target.closest('.hfolder-grid') ? 'group' : e.target.closest('.hgrid2') ? 'item' : '';
    const sameKind = entries.length && entries.every(entry => entry.kind === entries[0].kind);
    if (cardGrid && !breadcrumb && sameKind && entries[0].kind === 'item' && targetEntry && targetEntry.dataset.hdrag === 'item') {
      const box = targetEntry.getBoundingClientRect(), after = Math.abs(e.clientX - (box.left + box.width / 2)) > Math.abs(e.clientY - (box.top + box.height / 2))
        ? e.clientX > box.left + box.width / 2 : e.clientY > box.top + box.height / 2;
      e.preventDefault(); e.stopPropagation();
      return reorderCards(entries, `item:${targetEntry.dataset.hid}`, after);
    }
    if (cardGrid && !breadcrumb && sameKind && entries[0].kind === 'group' && target && targetEntry && targetEntry.dataset.hdrag === 'group') {
      const box = target.getBoundingClientRect(), distances = [
        { distance: Math.abs(e.clientX - box.left), after: false },
        { distance: Math.abs(e.clientX - box.right), after: true },
        { distance: Math.abs(e.clientY - box.top), after: false },
        { distance: Math.abs(e.clientY - box.bottom), after: true }
      ].sort((a, b) => a.distance - b.distance);
      if (distances[0].distance < 18) {
        e.preventDefault(); e.stopPropagation();
        return reorderCards(entries, `group:${target.dataset.dropGroup}`, distances[0].after);
      }
    }
    if (cardGrid && !target && !breadcrumb && sameKind && cardSection === entries[0].kind) {
      e.preventDefault(); e.stopPropagation(); return reorderCards(entries, null);
    }
    const parentId = breadcrumb ? breadcrumb.dataset.dropParent : target ? target.dataset.dropGroup : hs.currentGroupId;
    if (target && entries.some(entry => entry.kind === 'group' && entry.id === target.dataset.dropGroup)) return;
    if (target || breadcrumb || e.target.closest('#hgroups')) {
      e.preventDefault(); e.stopPropagation();
      hs.selected = entries; hs.anchor = entries[0] ? entryKey(entries[0]) : null;
      moveEntries(entries, parentId);
    }
  }
  function onDragEnd() { dragSource = null; document.querySelectorAll('.hfolder.drop-target,.h-tree-node.drop-target,.h-table-folder.drop-target,.hcard.drop-target,.hcrumb.drop-target').forEach(el => el.classList.remove('drop-target')); }
  function onInput(e) {
    const t = e.target; if (t.id === 'hq') { hs.q = t.value; return render(); }
    if (t.id === 'hta' && cur) { cur.code[cur.lang] = t.value; cur.dirty = true; refreshSolutionSoon(t); clearTimeout(saveT); saveT = setTimeout(flush, 500); }
  }
  function onImageWheel(e) { if (!e.target.closest('.hpimg-wrap')) return; e.preventDefault(); zoomImage(e.deltaY < 0 ? .15 : -.15); }
  // ---------- kéo (pan) ảnh: hoạt động ở mọi mức zoom, mượt (gộp theo khung hình), không kéo ảnh ra khỏi khung
  let panRaf = 0;
  const imageRot = () => { const ci = cur && byId(cur.id), cm = ci && (ci.imgs || [])[imageState.idx]; return cm ? (cm.rot || 0) : 0; };
  function clampImagePan(rot = imageRot()) {
    const box = $('#hdImg'), wrap = box && box.querySelector('.hpimg-wrap'), img = wrap && wrap.querySelector('.hpimg');
    if (!img || !img.offsetWidth || !img.offsetHeight) return;
    const swap = rot % 180 !== 0, w = (swap ? img.offsetHeight : img.offsetWidth) * imageState.zoom, h = (swap ? img.offsetWidth : img.offsetHeight) * imageState.zoom;
    const lim = (size, view) => Math.max(0, (size - view) / 2) + Math.min(size, view) / 2;   // luôn còn ít nhất một nửa ảnh trong khung
    const mx = lim(w, wrap.clientWidth), my = lim(h, wrap.clientHeight);
    imageState.x = Math.max(-mx, Math.min(mx, imageState.x)); imageState.y = Math.max(-my, Math.min(my, imageState.y));
  }
  function paintImagePan() {
    panRaf = 0; const d = imageState.drag, img = d && d.img; if (!img || !img.isConnected) return;
    img.style.transform = `translate(${imageState.x}px, ${imageState.y}px) scale(${imageState.zoom}) rotate(${d.rot}deg)`;
  }
  function onImageDown(e) {
    const wrap = e.target.closest && e.target.closest('.hpimg-wrap');                            // bấm ở bất kỳ đâu trong khung xem, không chỉ trên ảnh
    if (!wrap || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    imageState.drag = { pointerId: e.pointerId, lx: e.clientX, ly: e.clientY, wrap, img: wrap.querySelector('.hpimg'), rot: imageRot() };
    wrap.classList.add('panning'); try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function onImageMove(e) {
    const d = imageState.drag; if (!d || d.pointerId !== e.pointerId) return;
    if (!d.wrap.isConnected) { imageState.drag = null; return; }
    imageState.x += e.clientX - d.lx; imageState.y += e.clientY - d.ly; d.lx = e.clientX; d.ly = e.clientY;   // cộng dồn: đổi chiều là ảnh đi theo ngay
    clampImagePan(d.rot); if (!panRaf) panRaf = requestAnimationFrame(paintImagePan);
  }
  function onImageUp(e) {
    const d = imageState.drag; if (!d || d.pointerId !== e.pointerId) return;
    if (panRaf) { cancelAnimationFrame(panRaf); paintImagePan(); }                                // vẽ nốt vị trí cuối trước khi kết thúc
    d.wrap.classList.remove('panning'); try { d.wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    imageState.drag = null;
  }
  async function onChange(e) {
    const t = e.target; if (t.id === 'hSite') { hs.site = t.value; return render(); } if (t.id === 'hStatus') { hs.status = t.value; return render(); } if (t.id === 'hRange') { hs.range = t.value; return render(); }
  }
  async function onBlur(e) {
    if (e.target.id !== 'hta' || !cur) return; await flush();
  }
  function onKey(e) {
    if (!active) return; const tag = document.activeElement && document.activeElement.tagName, typing = /INPUT|TEXTAREA|SELECT/.test(tag);
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target && e.target.id === 'hta') { indentSolution(e); return; }
    if (C.isKey(e, 'esc') && imageState.fullscreen) { imageState.fullscreen = false; updateImageView(); return; }
    if (C.isKey(e, 'esc') && cur && !document.querySelector('.ctx,.askwrap') && $('#modal').hidden) { closeDrawer(); return; }
    if (C.isKey(e, 'esc') && hs.selected.length && !document.querySelector('.ctx,.askwrap') && $('#modal').hidden) { hs.selected = []; hs.anchor = null; updateSelection(); return; }
    if (typing || document.querySelector('.askwrap') || !$('#modal').hidden) return;
    if (cur) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'v') { e.preventDefault(); return addImage(cur.id, 'paste'); }     // Ctrl+V: dán ảnh từ clipboard vào bài đang mở
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === ',' || e.key === '<' || e.key === 'ArrowLeft') { e.preventDefault(); return navImage(-1); }
        if (e.key === '.' || e.key === '>' || e.key === 'ArrowRight') { e.preventDefault(); return navImage(1); }
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); return rotateImage(e.shiftKey ? -1 : 1); }
      }
    }
    if (C.isKey(e, 'newFolder')) { e.preventDefault(); return newGroup(); }
    const clipAct = ['cut', 'copy', 'paste'].find(a => C.isKey(e, a));
    if (clipAct) {
      e.preventDefault();
      if (clipAct === 'cut') return setClipboard('cut');
      if (clipAct === 'copy') return setClipboard('copy');
      return pasteEntries();
    }
    if (C.isKey(e, 'rename')) {
      const only = hs.selected.length === 1 ? hs.selected[0] : null;
      if (hs.sel) { e.preventDefault(); return rename(hs.sel); }
      if (only) { e.preventDefault(); return only.kind === 'group' ? renameGroup(only.id) : rename(only.id); }
    }
    if (C.isKey(e, 'del') && hs.selected.length) { e.preventDefault(); deleteSelected(); return; }
    if (C.isKey(e, 'del') && hs.sel) { e.preventDefault(); del(hs.sel); }
    if (e.key === 'Backspace' && hs.currentGroupId) { e.preventDefault(); const parent = groups.find(group => group.id === hs.currentGroupId)?.parentId || ''; navigateTo(parent); return; }
    if (e.key === 'Enter' && document.activeElement?.matches('.hfolder-head,.h-tree-folder')) { e.preventDefault(); navigateTo(document.activeElement.dataset.hid); return; }
    if (e.key === 'Enter' && hs.selected.length === 1 && hs.selected[0].kind === 'group') { navigateTo(hs.selected[0].id); return; }
    if (e.key === 'Enter' && hs.selected.length === 1 && hs.selected[0].kind === 'item' && !cur) { e.preventDefault(); openDrawer(hs.selected[0].id); return; }
    if (e.key === 'Enter' && !cur && document.activeElement && document.activeElement.matches && document.activeElement.matches('.hcard')) { e.preventDefault(); openDrawer(document.activeElement.dataset.hid); return; }
    if (e.key === 'Enter' && hs.sel && !cur) { openDrawer(hs.sel); }
  }
  return { init, show, hide, rerender, create, count: () => list.length };
})();
