// components/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Header.css';
import UserNav from './UserNav';

export default function Header() {
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [counts, setCounts] = useState({});
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const updateHeaderData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setUser(await res.json());
        } catch (error) {
          console.error('Failed to fetch user', error);
        }
      } else {
        setUser(null);
      }

      const selectedCommunity = localStorage.getItem('selectedCommunity');
      if (selectedCommunity) {
        setCurrentCommunity(selectedCommunity);
        document.body.className = `${selectedCommunity}-theme`;
        try {
          const res = await fetch('/api/community/counts');
          const data = await res.json();
          setCounts(data);
        } catch (error) {
          console.error("Failed to fetch counts", error);
        }
      } else {
        document.body.className = '';
        setCurrentCommunity(null);
      }
    };

    updateHeaderData();
    window.addEventListener('storage', updateHeaderData);
    return () => window.removeEventListener('storage', updateHeaderData);
  }, [pathname]);

  const memberCount = currentCommunity && counts[currentCommunity] !== undefined
    ? counts[currentCommunity]
    : 0;

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          {currentCommunity && (
            <div className="community-display">
              <span className="community-name">{currentCommunity.toUpperCase()}</span>
              <span className="community-count">{memberCount.toLocaleString()} members</span>
            </div>
          )}
        </div>

        <div className="header-center">
          <nav className="main-nav">
            <Link href="/feed" className={pathname === '/feed' ? 'active' : ''}>Feed</Link>
            <Link href="/live" className={pathname === '/live' ? 'active' : ''}>Live</Link>
            <Link href="/games" className={pathname === '/games' ? 'active' : ''}>Games</Link>
            <Link href="/alerts" className={pathname === '/alerts' ? 'active' : ''}>Alerts</Link>
          </nav>
        </div>

        <div className="header-right">
          {user && (
            <div className="user-display">
              {/* --- MODIFIED: Added community theme class to username --- */}
              <span className={`username ${currentCommunity}-text`}>{user.username}</span>
              <div className="rax-display">
                {/* --- MODIFIED: Changed the emoji --- */}
                <span className="rax-icon">💰</span>
                <span>{user.rax?.toLocaleString() || 0}</span>
              </div>
            </div>
          )}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
