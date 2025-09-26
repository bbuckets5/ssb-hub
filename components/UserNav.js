// components/UserNav.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './UserNav.css';

export default function UserNav({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedCommunity');
    document.body.className = '';
    setIsOpen(false);
    window.location.href = '/'; 
  };

  return (
    <div className="user-nav-container" ref={dropdownRef}>
      <button className="user-icon-button" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-user-circle"></i>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          {user ? (
            <>
              {/* --- NEW: Conditional Admin Link --- */}
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>
              )}
              <Link href="/" onClick={() => setIsOpen(false)}>Change Allegiance</Link>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
