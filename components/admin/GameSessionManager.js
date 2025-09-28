// components/admin/GameSessionManager.js
'use client';

import { useState, useEffect } from 'react';

export default function GameSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGameSessions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      // This API fetches all game sessions, regardless of status
      const res = await fetch('/api/trivia/game-sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch game sessions.');
      setSessions(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameSessions();
  }, []);

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/trivia/game-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      // Refresh the list to show the new status
      fetchGameSessions();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Loading game sessions...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="game-session-manager">
      <h2>Game Session Control</h2>
      {sessions.length === 0 ? (
        <p>No game sessions created yet.</p>
      ) : (
        <div className="sessions-list">
          {sessions.map(session => (
            <div key={session._id} className="session-card">
              <div className="session-info">
                <h3>{session.title}</h3>
                <p>{session.questions.length} Questions</p>
                <p className={`status-pill status-${session.status}`}>{session.status}</p>
              </div>
              <div className="session-actions">
                {session.status === 'pending' && (
                  <button className="start-btn" onClick={() => handleUpdateStatus(session._id, 'active')}>
                    Start Game
                  </button>
                )}
                {session.status === 'active' && (
                  <button className="end-btn" onClick={() => handleUpdateStatus(session._id, 'finished')}>
                    End Game
                  </button>
                )}
                {session.status === 'finished' && (
                  <p className="finished-text">Game Finished</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
