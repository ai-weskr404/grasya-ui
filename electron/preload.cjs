const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  ping: () => 'pong',
  newJobWindow: () => ipcRenderer.invoke('app:new-job-window'),
});
