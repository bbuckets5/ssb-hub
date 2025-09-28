// app/(main)/games/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './GamesPage.css';

export default function GamesPage() {
  const [gameSessions, setGameSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameSessions = async () => {
      try {
        const res = await fetch('/api/trivia/game-sessions');
        if (!res.ok) {
          throw new Error('Failed to fetch game sessions.');
        }
        setGameSessions(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameSessions();
  }, []);

  return (
    <div className="games-lobby-container">
      <h1>Trivia Royale</h1>
      <p>Choose a game session to play.</p>
      
      {isLoading && <p>Loading games...</p>}
      {error && <p className="error-text">Error: {error}</p>}
      
      {!isLoading && !error && (
        <div className="game-sessions-grid">
          {gameSessions.length === 0 ? (
            <p>No active games right now. Check back later!</p>
          ) : (
            gameSessions.map(session => (
              <Link key={session._id} href={`/games/${session._id}`} className="game-card">
                <h2>{session.title}</h2>
                <div className="game-card-details">
                  <span>{session.questions.length} Questions</span>
                  <span>Created by: {session.createdBy?.username || 'Admin'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
