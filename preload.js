const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Frontend to Main
  startOnboarding: (userTask) => ipcRenderer.send('start-onboarding', userTask),
  startMonitoringLoop: () => ipcRenderer.send('start-monitoring-loop'),

  // Main to Frontend
  onOnboardingComplete: (callback) => ipcRenderer.on('onboarding-complete', (event) => callback()),
  onUpdateActivity: (callback) => ipcRenderer.on('update-activity', (event, activity) => callback(activity)),
  onNewAlert: (callback) => ipcRenderer.on('new-alert', (event, message) => callback(message)),

  // Cleanup listeners
  cleanup: () => {
    ipcRenderer.removeAllListeners('onboarding-complete');
    ipcRenderer.removeAllListeners('update-activity');
    ipcRenderer.removeAllListeners('new-alert');
  }
});