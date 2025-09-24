// components/CreatePost.js
'use client';

import { useState } from 'react';
import './CreatePost.css';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        const newPost = await res.json();
        if (!res.ok) {
            throw new Error(newPost.message || 'Failed to create post.');
        }

        onPostCreated(newPost); // Pass the new post from the DB to the parent
        setContent(''); // Clear the textarea

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="create-post-textarea"
          rows="3"
        />
        <div className="create-post-actions">
          {error && <p className="error-message">{error}</p>}
          <button 
            type="submit" 
            className="cta-button" 
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
