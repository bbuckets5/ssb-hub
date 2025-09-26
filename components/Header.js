// components/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './Header.css';
import UserNav from './UserNav';

export default function Header() {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const updateHeaderData = async () => {
      const token = localStorage.getItem('authToken');
      let currentUser = null;
      if (token) {
        try {
          const res = await fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            currentUser = await res.json();
            setUser(currentUser);
          } else {
            // Bad token, clear it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
        }
      } else {
        setUser(null);
      }

      // Theming is now based on the USER's actual community from the database
      const community = currentUser?.community || localStorage.getItem('selectedCommunity');
      if (community) {
        document.body.className = `${community}-theme`;
        try {
          const res = await fetch('/api/community/counts');
          const data = await res.json();
          setCounts(data);
        } catch (error) {
          console.error("Failed to fetch counts", error);
        }
      } else {
        document.body.className = '';
      }
    };

    updateHeaderData();
    window.addEventListener('storage', updateHeaderData);
    return () => window.removeEventListener('storage', updateHeaderData);
  }, [pathname]);

  const memberCount = user?.community && counts[user.community] !== undefined
    ? counts[user.community]
    : 0;

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          {/* Show community info ONLY if the user has pledged */}
          {user && user.community && (
            <div className="community-display">
              <span className="community-name">{user.community.toUpperCase()}</span>
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
          {user ? (
            // If user is logged in...
            user.community ? (
              // ...and has a community, show their stats
              <div className="user-display">
                <span className={`username ${user.community}-text`}>{user.username}</span>
                <div className="rax-display">
                  <span className="rax-icon">💰</span>
                  <span>{user.rax?.toLocaleString() || 0}</span>
                </div>
              </div>
            ) : (
              // ...but has NO community, show a pledge button
              <button className="cta-button" onClick={() => router.push('/')}>
                Choose Your Community
              </button>
            )
          ) : null } {/* If not logged in, show nothing here */}
          
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
