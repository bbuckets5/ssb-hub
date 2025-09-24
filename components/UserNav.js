// components/UserNav.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import './UserNav.css';

export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        // Handle invalid token by clearing it
        localStorage.removeItem('authToken');
      }
    }
  }, []);

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
    // --- MODIFIED: Added cleanup for theme ---
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedCommunity'); // 1. Remove the saved community
    document.body.className = ''; // 2. Reset the theme on the body tag
    // -----------------------------------------
    setUser(null);
    setIsOpen(false);
    router.push('/');
    // Use window.location.reload() for a hard refresh to ensure clean state
    window.location.reload(); 
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
              <div className="user-info">Welcome, {user.username}!</div>
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
