// app/(main)/games/page.js
'use client';

import { useState, useEffect } from 'react';
import DailyQuestion from "@/components/DailyQuestion";
import QuestionForm from "@/components/QuestionForm";
import Leaderboard from "@/components/Leaderboard"; // Import the new component

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
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', textAlign: 'center', marginBottom: '1rem' }}>Question of the Day</h1>
        <DailyQuestion />
      </div>

      {/* Replace the placeholder with our new component */}
      <div>
        <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Top Players</h2>
        <Leaderboard />
      </div>
      
      {isLoggedIn && <QuestionForm />}
    </div>
  );
}
