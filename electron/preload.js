const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  startMonitoring: (goal) => ipcRenderer.invoke('start-monitoring', goal),
  sendVideoChunk: (chunk) => ipcRenderer.send('video-chunk', chunk),
  onUpdateStatus: (callback) => {
    const listener = (event, ...args) => callback(...args);
    ipcRenderer.on('update-status', listener);
    return () => ipcRenderer.removeListener('update-status', listener);
  },
});