// components/UserNav.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './UserNav.css';

export default function UserNav({ user }) { // Receives user as a prop
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // This effect handles closing the dropdown if you click outside of it
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
    // Use window.location.href for a full page reload to ensure clean state
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
            // The dropdown is now simpler for logged-in users
            <>
              {/* We can add links like 'My Profile' here later */}
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
