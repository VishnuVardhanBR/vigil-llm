
import React, { useState, useRef, useEffect, useCallback } from 'react';

const RECORDING_INTERVAL_MS = 5000; // 10 seconds
const CLIP_DURATION_MS = 4000; // 4 seconds

function App() {
  const [goal, setGoal] = useState('');
  const [appState, setAppState] = useState('onboarding'); // 'onboarding', 'monitoring', 'error'
  const [currentActivity, setCurrentActivity] = useState('Initializing...');
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const monitoringIntervalRef = useRef(null);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please check permissions.");
        setAppState('error');
      }
    }
    setupWebcam();
  }, []);

  useEffect(() => {
    // Listener for immediate activity updates
    const cleanupActivity = window.api.onUpdateActivity((activity) => {
      console.log('Received activity update:', activity);
      setCurrentActivity(activity);
    });

    // Listener for delayed alert updates
    const cleanupAlert = window.api.onUpdateAlert((alertData) => {
      console.log('Received alert update:', alertData);
      const newAlert = {
        message: alertData.message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    });

    // Cleanup both listeners when the component unmounts
    return () => {
      cleanupActivity();
      cleanupAlert();
    };
  }, []);

  const startRecordingAndSend = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

      const recordedChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });

        // CHANGE 1 of 2: Convert the Blob to an ArrayBuffer, a browser-safe format.
        const videoArrayBuffer = await videoBlob.arrayBuffer();

        // CHANGE 2 of 2: Send the ArrayBuffer directly. DO NOT create a Buffer here.
        window.api.sendVideoChunk(videoArrayBuffer);

      };

      mediaRecorderRef.current.start();
      console.log('Recording started...');
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          console.log('Recording stopped.');
        }
      }, CLIP_DURATION_MS);
    }
  }, []);

  const handleStartMonitoring = async () => {
    setCurrentActivity('Generating security context...');
    const response = await window.api.startMonitoring(goal);
    if (response.success) {
      setAppState('monitoring');
      startRecordingAndSend();
      monitoringIntervalRef.current = setInterval(startRecordingAndSend, RECORDING_INTERVAL_MS);
    } else {
      setError(response.message);
      setAppState('error');
    }
  };


  const renderOnboarding = () => (
    <div className="onboarding">
      <h1>AI Monitoring System</h1>
      <p>Describe what you want to monitor. The AI will generate a security context based on your goal.</p>
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows="3"
        placeholder="e.g., Monitor my baby and alert me to danger"
      />
      <button onClick={handleStartMonitoring}>Start Monitoring</button>
    </div>
  );

  const renderMonitoring = () => (
    <div className="monitoring">
      <div className="status-panel">
        <h2>Live Feed</h2>
        <p><strong>Current Activity:</strong> {currentActivity}</p>
      </div>
      <div className="alerts-panel">
        <h3>Alerts</h3>
        <div className="alerts-list">
          {alerts.length === 0 ? <p>No alerts yet.</p> :
            alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <strong>{alert.timestamp}:</strong> {alert.message}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="error-screen">
      <h2>An Error Occurred</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="app-container">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted></video>
      </div>
      <div className="controls-container">
        {appState === 'onboarding' && renderOnboarding()}
        {appState === 'monitoring' && renderMonitoring()}
        {appState === 'error' && renderError()}
      </div>
    </div>
  );
}

export default App;