// app/(main)/games/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DailyQuestion from "@/components/DailyQuestion";
import QuestionForm from "@/components/QuestionForm";
import Leaderboard from "@/components/Leaderboard";
import './GamesPage.css';

export default function GamesPage() {
  const [gameSessions, setGameSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }

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
    <div className="page-container">
      <div className="section">
        <h1 className="page-title">Trivia Royale</h1>
        <p className="page-subtitle">Choose a game session to play or try the Question of the Day.</p>
        
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

      <div className="section">
        <h2 className="section-title">Question of the Day</h2>
        <DailyQuestion />
      </div>

      <div className="section">
        <h2 className="section-title">Top Players</h2>
        <Leaderboard />
      </div>
      
      {isLoggedIn && (
        <div className="section">
          <QuestionForm />
        </div>
      )}
    </div>
  );
}
