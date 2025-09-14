const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Determine if we are in a development environment
const isDev = !app.isPackaged;

let mainWindow;
const RUN_VIDEO_MODEL_INTERVAL = 5000;
let monitoringInterval;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadFile("index.html");

  if (isDev) {
    // In development, load from the Vite dev server
    win.loadURL('http://localhost:5173');
    // Open DevTools for debugging
    win.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    // You would first need to run `npm run build`
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// ... (The rest of your main.js file remains exactly the same) ...
// (All ipcMain handlers for 'start-onboarding', etc. are unchanged)

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers --- (Keep all your existing ipcMain code here)

ipcMain.on('start-onboarding', (event, userTaskText) => {
  console.log('Main: Received user task:', userTaskText);
  const prompt = `Based on the task '${userTaskText}', list potential harmful or dangerous scenarios. List each scenario on a new line.`;
  const pythonProcess = spawn('python', [path.join(__dirname, 'backend/run_text_llm.py'), prompt]);
  let scenariosOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    scenariosOutput += data.toString();
  });
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      fs.writeFileSync(path.join(__dirname, 'scenarios.txt'), scenariosOutput.trim());
      event.sender.send('onboarding-complete');
    } else {
      console.error(`Main: Python script for onboarding exited with code ${code}`);
    }
  });
});

ipcMain.on('start-monitoring-loop', (event) => {
  console.log('Main: Starting the monitoring loop.');
  if (monitoringInterval) clearInterval(monitoringInterval);

  const performMonitoringStep = () => {
    const videoPath = path.join(__dirname, 'backend/assets/demo_video.mp4');
    const videoModelProcess = spawn('python', [path.join(__dirname, 'backend/run_video_model.py'), videoPath]);
    let videoPredictions = '';
    videoModelProcess.stdout.on('data', (data) => {
      videoPredictions += data.toString();
    });
    videoModelProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Main: Video model script exited with code ${code}`);
        return;
      }
      const predictionsList = videoPredictions.trim().split(',').map(p => p.trim());
      const topPrediction = predictionsList[0];
      mainWindow.webContents.send('update-activity', topPrediction);

      const scenarios = fs.readFileSync(path.join(__dirname, 'scenarios.txt'), 'utf8');
      const alertPrompt = `Context: The system is monitoring for these harmful scenarios: [${scenarios}]. The camera currently sees: [${predictionsList.join(', ')}]. Based on this, should an alert be sent? Respond only with JSON in the format: {"alert": boolean, "message": "A concise description of the alert"}.`;
      const alertLlmProcess = spawn('python', [path.join(__dirname, 'backend/run_text_llm.py'), alertPrompt]);
      let alertJsonOutput = '';
      alertLlmProcess.stdout.on('data', (data) => {
        alertJsonOutput += data.toString();
      });
      alertLlmProcess.on('close', (alertCode) => {
        if (alertCode === 0) {
          try {
            const result = JSON.parse(alertJsonOutput.trim());
            if (result.alert) {
              mainWindow.webContents.send('new-alert', result.message);
            }
          } catch (e) {
            console.error('Main: Failed to parse JSON from alert LLM:', e, 'Received:', alertJsonOutput);
          }
        }
      });
    });
  };

  performMonitoringStep();
  monitoringInterval = setInterval(performMonitoringStep, RUN_VIDEO_MODEL_INTERVAL);
});