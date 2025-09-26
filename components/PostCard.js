// components/PostCard.js
'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import './PostCard.css';

export default function PostCard({ post }) {
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const likesArray = Array.isArray(post.likes) ? post.likes : [];
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (likesArray.includes(decoded.userId)) {
          setIsLiked(true);
        }
      } catch (err) {
        // This can happen if the token is invalid or expired
        console.error('Invalid token:', err);
      }
    }
  }, [post.likes]);

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
