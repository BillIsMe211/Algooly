const { contextBridge, ipcRenderer, webUtils } = require('electron');
const fs = require('fs'), path = require('path');
let cache;
const INV = new Set(['h-active', 'h-add-image', 'h-del-image', 'h-pick-solution', 'h-export-zip', 'h-export-selection-zip', 'h-import-zip', 'h-import-folder', 'lib-export-zip', 'lib-import-zip', 'lib-import-folder', 'h-scan', 'h-read', 'h-write', 'h-meta', 'h-delete', 'h-delete-many', 'h-rename', 'h-new', 'h-new-group', 'h-move', 'h-move-many', 'h-copy-many', 'h-open', 'h-copyimg', 'h-copy-url', 'h-path', 'h-pickroot', 'cfg-get', 'cfg-set', 'key-set', 'ai-refresh', 'h-estimate', 'ai-models', 'network-status', 'win-ismax']);
const ON = new Set(['history-changed', 'history-new', 'toast', 'network-status', 'maxstate', 'pop', 'goto']);
contextBridge.exposeInMainWorld('api', {
  data: () => cache || (cache = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/library.json'), 'utf8'))),
  win: a => ipcRenderer.send('win', a), quit: () => ipcRenderer.send('quit'), setLang: l => ipcRenderer.send('lang', l), setTheme: t => ipcRenderer.send('theme', t),
  openExt: u => ipcRenderer.send('open-ext', u),
  pickBg: src => ipcRenderer.invoke('copy-bg', src || null),
  pathOf: f => { try { return webUtils.getPathForFile(f); } catch (e) { return ''; } },
  inv: (ch, ...a) => INV.has(ch) ? ipcRenderer.invoke(ch, ...a) : Promise.reject(new Error('blocked')),
  on: (ch, cb) => { if (ON.has(ch)) ipcRenderer.on(ch, (_, ...a) => cb(...a)); }
});
