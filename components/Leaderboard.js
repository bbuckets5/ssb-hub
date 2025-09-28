// components/Leaderboard.js
'use client';

import { useState, useEffect } from 'react';
import './Leaderboard.css';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/users/leaderboard');
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard data.');
        }
        setUsers(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) return <p>Loading leaderboard...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="leaderboard-container">
      <ol className="leaderboard-list">
        {users.map((user, index) => (
          <li key={user._id} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <span className={`username ${user.community}-text`}>{user.username}</span>
            <span className="rax-score">{user.rax.toLocaleString()} Rax</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
