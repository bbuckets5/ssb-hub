// components/InviteCodeModal.js

'use client';

import { useState } from 'react';
import './InviteCodeModal.css';

export default function InviteCodeModal({ isOpen, onClose, onSubmit, communityName }) {
  const [code, setCode] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Pledge Allegiance to {communityName.toUpperCase()}</h2>
        <p>Enter the secret invite code to join this community.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Invite Code..."
            className="modal-input"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="modal-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-button primary">
              Submit Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
