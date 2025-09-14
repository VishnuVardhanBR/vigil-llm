// electron/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;
const { generateMonitoringContext, decideOnAlert } = require('./backend/ai_handler');
const { analyzeVideo } = require('./backend/video_processor');

const userDataPath = app.getPath('userData');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath);
}
const contextFilePath = path.join(userDataPath, 'monitoring_context.txt');
const tempVideoPath = path.join(userDataPath, 'temp_clip.mp4');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('start-monitoring', async (event, userGoal) => {
  try {
    console.log('Received user goal:', userGoal);
    const contextList = await generateMonitoringContext(userGoal);
    fs.writeFileSync(contextFilePath, contextList);
    console.log('Monitoring context saved.');
    return { success: true, message: 'Context generated successfully.' };
  } catch (error) {
    console.error('Failed to start monitoring:', error);
    return { success: false, message: error.message };
  }
});

// electron/main.js

// ... (top of the file is the same) ...

ipcMain.on('video-chunk', async (event, videoArrayBuffer) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  try {
    console.log('\n--- [Monitoring Cycle Start] ---');
    
    const videoBuffer = Buffer.from(videoArrayBuffer);
    fs.writeFileSync(tempVideoPath, videoBuffer);
    console.log(`[INFO] Video chunk saved to ${tempVideoPath}`);

    console.log('[INFO] Calling analyzeVideo script...');
    const rawPythonOutput = await analyzeVideo(tempVideoPath); // Renamed for clarity

    console.log(`[INFO] Activities received from video_processor: "${rawPythonOutput}"`);

    // --- NEW PARSING LOGIC STARTS HERE ---
    let topActivity = "Parsing..."; // Default value
    
    // Find the line with the predictions.
    const lines = rawPythonOutput.split('\n');
    const predictionsLine = lines.find(line => line.toLowerCase().includes('predictions:'));

    if (predictionsLine) {
      // Split the line by the colon to get the list of activities
      const parts = predictionsLine.split(':');
      if (parts.length > 1) {
        // Get the activities string, split by comma, and take the first one
        const allActivities = parts[1].split(',');
        if (allActivities.length > 0) {
          topActivity = allActivities[0].trim(); // Trim whitespace
        } else {
          topActivity = "No activities found";
        }
      } else {
        topActivity = "Format error in prediction";
      }
    } else {
      topActivity = "No predictions line found";
    }
    // --- NEW PARSING LOGIC ENDS HERE ---


    // Get decision from Gemini using the FULL raw output for better context
    const context = fs.readFileSync(contextFilePath, 'utf-8');
    const decision = await decideOnAlert(context, rawPythonOutput);

    console.log(`[INFO] Top activity parsed for UI: "${topActivity}"`);
    console.log(`[INFO] Gemini decision:`, decision);

    const payload = {
      activity: topActivity, // Use our newly parsed top activity
      alert: decision,
    };
    
    console.log('[INFO] Sending "update-status" to frontend with payload:', payload);
    window.webContents.send('update-status', payload);

  } catch (error) {
    console.error('[FATAL] Error in monitoring loop:', error.message);
    window.webContents.send('update-status', {
      activity: 'Error processing video.',
      alert: { alert: true, message: 'An error occurred in the backend. Check terminal logs.' },
    });
  }
});