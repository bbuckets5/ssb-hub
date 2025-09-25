// app/(main)/signup/page.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // 1. Import useSearchParams
import './Signup.css';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // 2. Get the community choice from the URL
  const searchParams = useSearchParams();
  const community = searchParams.get('community');

  const [passwordStrength, setPasswordStrength] = useState({
    // ... password strength logic remains the same
  });

  const handlePasswordChange = (e) => {
    // ... this function remains the same
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    
    const allReqsMet = Object.values(passwordStrength).every(Boolean);
    if (!allReqsMet) {
        setMessage('Password does not meet all requirements.');
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 3. Send the community choice to the API
        body: JSON.stringify({ username, email, password, community }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      setMessage('Success! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setMessage(error.message);
      setIsLoading(false);
    }
  };
  
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="auth-container">
      <div className="auth-form-container glass">
        <h1>Create Account</h1>

        {/* 4. Display a confirmation message */}
        {community && (
          <p className="community-join-message">
            You&apos;re joining the <span className={`${community}-text`}>{community.toUpperCase()}</span> community!
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={handlePasswordChange} required />
          </div>
          <div className="password-strength-checker">
            {/* ... strength checker UI ... */}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          {confirmPassword && (
            <div className={`password-match-indicator ${passwordsMatch ? 'valid' : 'invalid'}`}>
              {passwordsMatch ? '✓ Passwords Match' : 'Passwords do not match'}
            </div>
          )}
          <button type="submit" className="cta-button" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</button>
        </form>
        {message && <p className="form-message">{message}</p>}
        <p className="auth-switch-link">Already have an account? <Link href="/login">Log In</Link></p>
      </div>
    </div>
  );
}
