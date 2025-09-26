// components/SignupForm.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/app/(main)/signup/Signup.css'; // Corrected CSS import path

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const community = searchParams.get('community');

  const [passwordStrength, setPasswordStrength] = useState({
    hasCapital: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLongEnough: false,
  });

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength({
      hasCapital: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      isLongEnough: newPassword.length >= 8,
    });
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
            <div className={`strength-requirement ${passwordStrength.isLongEnough ? 'valid' : 'invalid'}`}>At least 8 characters</div>
            <div className={`strength-requirement ${passwordStrength.hasCapital ? 'valid' : 'invalid'}`}>One uppercase letter</div>
            <div className={`strength-requirement ${passwordStrength.hasNumber ? 'valid' : 'invalid'}`}>One number</div>
            <div className={`strength-requirement ${passwordStrength.hasSpecialChar ? 'valid' : 'invalid'}`}>One special character</div>
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
