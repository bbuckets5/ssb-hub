// app/(main)/games/page.js
'use client';

import { useState, useEffect } from 'react';
import TriviaGame from "@/components/TriviaGame";
import QuestionForm from "@/components/QuestionForm"; // Import the new form

export default function GamesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>SSB Trivia Royale</h1>
      <TriviaGame />
      
      {/* Conditionally render the form for logged-in users */}
      {isLoggedIn && <QuestionForm />}
    </div>
  );
}
