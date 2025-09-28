// components/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './Header.css';
import UserNav from './UserNav';

export default function Header() {
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [counts, setCounts] = useState({});
  const [user, setUser] = useState(null);
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
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
        }
      } else {
        setUser(null);
      }

      const community = currentUser?.community || localStorage.getItem('selectedCommunity');
      if (community) {
        setCurrentCommunity(community);
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
            <Link href="/clipper" className={pathname === '/clipper' ? 'active' : ''}>Clipper</Link>
          </nav>
        </div>

        <div className="header-right">
          {user ? (
            user.community ? (
              <div className="user-display">
                <span className={`username ${user.community}-text`}>{user.username}</span>
                <div className="rax-display">
                  <span className="rax-icon">💰</span>
                  <span>{user.rax?.toLocaleString() || 0}</span>
                </div>
              </div>
            ) : (
              <button className="cta-button" onClick={() => router.push('/')}>
                Choose Your Community
              </button>
            )
          ) : null }
          
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}