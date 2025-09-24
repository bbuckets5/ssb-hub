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
  const pathname = usePathname();

  useEffect(() => {
    // Function to read from localStorage and fetch data
    const updateHeader = async () => {
      const selectedCommunity = localStorage.getItem('selectedCommunity');
      if (selectedCommunity) {
        setCurrentCommunity(selectedCommunity);
        
        // Apply theme to the whole page
        document.body.className = `${selectedCommunity}-theme`;

        // Fetch counts
        try {
          const res = await fetch('/api/community/counts');
          const data = await res.json();
          setCounts(data);
        } catch (error) {
          console.error("Failed to fetch counts for header", error);
        }
      }
    };

    updateHeader();

    // Listen for changes to localStorage from other tabs/windows
    window.addEventListener('storage', updateHeader);
    return () => window.removeEventListener('storage', updateHeader);
  }, []);

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
          </nav>
        </div>

        <div className="header-right">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
