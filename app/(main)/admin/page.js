// app/(main)/admin/page.js
'use client';

import { useState } from 'react';
import TriviaManager from '@/components/admin/TriviaManager';
import './AdminDashboard.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('trivia');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trivia':
        return <TriviaManager />;
      // We can add more cases for other admin tools later
      default:
        return <p>Select a tab</p>;
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'trivia' ? 'active' : ''}`}
          onClick={() => setActiveTab('trivia')}
        >
          Trivia Manager
        </button>
        {/* We can add more tab buttons here later */}
      </div>
      <div className="admin-content glass">
        {renderTabContent()}
      </div>
    </div>
  );
}
