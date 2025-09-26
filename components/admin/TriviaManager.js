// components/admin/TriviaManager.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaManager.css';

export default function TriviaManager() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/trivia/submissions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch submissions.');
        }
        
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleApprove = (questionId) => {
    alert(`Approving question ${questionId}... (API coming next)`);
  };

  const handleDeny = (questionId) => {
    alert(`Denying question ${questionId}... (API coming next)`);
  };

  if (isLoading) return <p>Loading submissions...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="trivia-manager">
      <h2>Trivia Submission Queue</h2>
      {questions.length === 0 ? (
        <p>No pending questions for review.</p>
      ) : (
        <div className="submissions-list">
          {questions.map((q) => (
            <div key={q._id} className="submission-card">
              <p className="submission-question">&quot;{q.questionText}&quot;</p>
              <ul className="submission-options">
                {q.options.map((option, i) => (
                  <li key={i} className={option === q.correctAnswer ? 'correct' : ''}>
                    {option}
                  </li>
                ))}
              </ul>
              <p className="submitted-by">Submitted by: {q.submittedBy?.username || 'Unknown'}</p>
              <div className="submission-actions">
                <button className="deny-btn" onClick={() => handleDeny(q._id)}>Deny</button>
                <button className="approve-btn" onClick={() => handleApprove(q._id)}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
