const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('notify', { hover: v => ipcRenderer.send('notify-hover', !!v), click: () => ipcRenderer.send('notify-click'), close: () => ipcRenderer.send('notify-close') });
