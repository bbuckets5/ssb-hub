// app/(main)/games/page.js
'use client';

import { useState, useEffect } from 'react';
import DailyQuestion from "@/components/DailyQuestion";
import QuestionForm from "@/components/QuestionForm";

export default function GamesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', textAlign: 'center' }}>Question of the Day</h1>
        <DailyQuestion />
      </div>

      {/* Placeholder for Leaderboard */}
      <div style={{width: '100%', maxWidth: '800px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Top Players</h2>
        <p style={{textAlign: 'center', opacity: '0.7'}}>Leaderboard coming soon...</p>
      </div>
      
      {isLoggedIn && <QuestionForm />}
    </div>
  );
}
