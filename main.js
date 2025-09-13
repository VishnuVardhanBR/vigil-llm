const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
const RUN_VIDEO_MODEL_INTERVAL = 5000; // 5 seconds
let monitoringInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // For this simple MVP, we load the HTML file directly.
  // In a real app, you would likely use a bundler (Vite, Webpack) and load a URL.
  mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

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

// --- IPC Handlers ---

// Phase 1: Onboarding
ipcMain.on('start-onboarding', (event, userTaskText) => {
  console.log('Main: Received user task:', userTaskText);

  const prompt = `Based on the task '${userTaskText}', list potential harmful or dangerous scenarios. List each scenario on a new line.`;

  // 1. Execute the Text LLM to generate harmful scenarios
  const pythonProcess = spawn('python', [path.join(__dirname, 'backend/run_text_llm.py'), prompt]);

  let scenariosOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    scenariosOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Main: Successfully generated scenarios.');
      // 2. Save scenarios to a file
      fs.writeFileSync(path.join(__dirname, 'scenarios.txt'), scenariosOutput.trim());
      console.log('Main: Scenarios saved to scenarios.txt');

      // 3. Notify the frontend that onboarding is complete
      event.sender.send('onboarding-complete');
    } else {
      console.error(`Main: Python script exited with code ${code}`);
      // Optionally, send an error message to the frontend
    }
  });
});

// Phase 2: Monitoring Loop
ipcMain.on('start-monitoring-loop', (event) => {
  console.log('Main: Starting the monitoring loop.');
  if (monitoringInterval) clearInterval(monitoringInterval);

  const performMonitoringStep = () => {
    // a. Define path to the hardcoded video
    const videoPath = path.join(__dirname, 'backend/assets/demo_video.mp4');
    
    // b. Run Video Model
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
      
      // c. Update Current Activity in UI
      console.log('Main: Sending activity update:', topPrediction);
      mainWindow.webContents.send('update-activity', topPrediction);

      // d. Check for Alerts
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
              console.log('Main: Sending new alert:', result.message);
              mainWindow.webContents.send('new-alert', result.message);
            }
          } catch (e) {
            console.error('Main: Failed to parse JSON from alert LLM:', e);
          }
        }
      });
    });
  };

  // Run the first check immediately, then start the interval
  performMonitoringStep();
  monitoringInterval = setInterval(performMonitoringStep, RUN_VIDEO_MODEL_INTERVAL);
});