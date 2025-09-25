// app/(main)/alerts/page.js
'use client';

import { useState } from 'react';
import './AlertsPage.css';

const soundAlerts = [
  { name: 'Bruh', file: '/sounds/bruh.mp3', cost: 50 },
  { name: 'Victory', file: '/sounds/victory.mp3', cost: 100 },
  { name: 'Tactical Nuke', file: '/sounds/nuke.mp3', cost: 500 },
  { name: 'Heck Yeah', file: '/sounds/heck-yeah.mp3', cost: 50 },
  { name: 'Oof', file: '/sounds/oof.mp3', cost: 25 },
  { name: 'Applause', file: '/sounds/applause.mp3', cost: 75 },
  { name: 'Laughter', file: '/sounds/laugh.mp3', cost: 50 },
  { name: 'Sad Trombone', file: '/sounds/trombone.mp3', cost: 50 },
];

export default function AlertsPage() {
  const [loadingSound, setLoadingSound] = useState(null); // To show loading state on a specific button

  const handlePlaySound = async (alert) => {
    setLoadingSound(alert.name);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to play a sound alert.');
      }

      const res = await fetch('/api/alerts/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ soundCost: alert.cost }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Transaction failed.');
      }

      // If the API call was successful, then play the sound
      const audio = new Audio(alert.file);
      audio.play();
      
      // After the sound plays, reload the page to update the Rax in the header
      audio.onended = () => {
        window.location.reload();
      };

    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingSound(null);
    }
  };

  return (
    <div className="alerts-page-container">
      <div className="alerts-header">
        <h1>Sound Alerts</h1>
        <p>Spend your &quot;SSB Rax&quot; to play a sound live on stream!</p>
      </div>
      <div className="alerts-grid">
        {soundAlerts.map((alert) => (
          <button 
            key={alert.name} 
            className="alert-button"
            onClick={() => handlePlaySound(alert)}
            disabled={loadingSound === alert.name}
          >
            <span className="alert-name">
              {loadingSound === alert.name ? 'Playing...' : alert.name}
            </span>
            <span className="alert-cost">{alert.cost} Rax</span>
          </button>
        ))}
      </div>
    </div>
  );
}
