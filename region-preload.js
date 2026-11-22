const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('region', {
  onShot: cb => ipcRenderer.on('shot', (_, buf) => cb(buf)),
  ready: () => ipcRenderer.send('region-ready'),
  done: r => ipcRenderer.send('region-done', r),
  cancel: () => ipcRenderer.send('region-cancel')
});
