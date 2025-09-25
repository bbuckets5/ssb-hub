// components/PostCard.js
'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './PostCard.css';

export default function PostCard({ post }) {
  // --- MODIFIED: This section is now smarter ---
  // It checks if post.likes is an array. If not (it's a number from old data),
  // it uses the number directly or defaults to 0.
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  // ------------------------------------------------

  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      // We use our safe 'likesArray' here
      if (likesArray.includes(decoded.userId)) {
        setIsLiked(true);
      }
    }
  }, [likesArray]); // Depend on the safe array

  const handleLike = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to like a post.');
      }

      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to like post.');
      }

      setIsLiked(true);
      setLikeCount(data.likes);

    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const communityClass = post?.author?.community ? `${post.author.community}-text` : '';

  return (
    <div className="post-card">
      <div className="post-author-info">
        <span className={`post-author-username ${communityClass}`}>
          {post?.author?.username || 'Unknown User'}
        </span>
        <span className="post-timestamp">· {postDate}</span>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button 
          className={`action-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiked || isLoading}
        >
          <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
          <span>{likeCount}</span>
        </button>
        {error && <span className="like-error">{error}</span>}
      </div>
    </div>
  );
}
