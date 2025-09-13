import React, { useState, useEffect } from 'react';

function App() {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [userTask, setUserTask] = useState('');
  const [currentActivity, setCurrentActivity] = useState('Initializing...');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Listener for when onboarding is finished
    window.electron.onOnboardingComplete(() => {
      console.log('Frontend: Onboarding complete message received.');
      setIsOnboarding(false);
      // Trigger the monitoring loop to start
      window.electron.startMonitoringLoop();
    });

    // Listener for activity updates
    window.electron.onUpdateActivity((activity) => {
      setCurrentActivity(activity);
    });

    // Listener for new alerts
    window.electron.onNewAlert((message) => {
      setAlerts(prevAlerts => [`${new Date().toLocaleTimeString()}: ${message}`, ...prevAlerts].slice(0, 5)); // Keep last 5 alerts
    });

    // Clean up listeners when the component unmounts
    return () => {
      window.electron.cleanup();
    };
  }, []);

  const handleStartMonitoring = () => {
    if (userTask.trim()) {
      window.electron.startOnboarding(userTask);
    }
  };

  if (isOnboarding) {
    return (
      <div className="container onboarding">
        <h1>Welcome</h1>
        <p>Please describe the task you want to monitor.</p>
        <textarea
          value={userTask}
          onChange={(e) => setUserTask(e.target.value)}
          placeholder="e.g., I want my baby to be monitored in its room"
        />
        <button onClick={handleStartMonitoring}>Start Monitoring</button>
      </div>
    );
  }

  return (
    <div className="container monitoring">
      <div className="main-view">
        <div className="video-placeholder">
          <h2>Live Monitoring Active</h2>
          <p>(Backend is processing a hardcoded video)</p>
        </div>
      </div>
      <div className="sidebar">
        <div className="activity-box">
          <h3>Current Activity</h3>
          <p>{currentActivity}</p>
        </div>
        <div className="alerts-box">
          <h3>Alerts</h3>
          {alerts.length === 0 ? (
            <p className="no-alerts">No alerts yet.</p>
          ) : (
            <ul>
              {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;