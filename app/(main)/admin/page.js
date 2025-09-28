// app/(main)/admin/page.js
'use client';

import { useState } from 'react';
import TriviaManager from '@/components/admin/TriviaManager';
import GameSessionManager from '@/components/admin/GameSessionManager'; // 1. Import the new component
import './AdminDashboard.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('sessions'); // 2. Default to the new tab

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trivia':
        return <TriviaManager />;
      case 'sessions': // 3. Add a case for the new component
        return <GameSessionManager />;
      default:
        return <p>Select a tab</p>;
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        {/* 4. Add the new tab button */}
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Game Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === 'trivia' ? 'active' : ''}`}
          onClick={() => setActiveTab('trivia')}
        >
          Trivia Manager
        </button>
      </div>
      <div className="admin-content glass">
        {renderTabContent()}
      </div>
    </div>
  );
}
