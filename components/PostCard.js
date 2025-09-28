// components/PostCard.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import Linkify from 'react-linkify';
import './PostCard.css';

export default function PostCard({ post, onPostDeleted }) {
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const likesArray = Array.isArray(post.likes) ? post.likes : [];
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (likesArray.includes(decoded.userId)) {
          setIsLiked(true);
        }
        if (post.author?._id === decoded.userId) {
          setIsAuthor(true);
        }
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
  }, [post.likes, post.author]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [optionsRef]);

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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete post.');
      }
      onPostDeleted(post._id);
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
      <div className="post-header">
        <div className="post-author-info">
          <span className={`post-author-username ${communityClass}`}>
            {post?.author?.username || 'Unknown User'}
          </span>
          <span className="post-timestamp">· {postDate}</span>
        </div>
        {isAuthor && (
          <div className="post-options" ref={optionsRef}>
            <button className="icon-button options-button" onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {isOptionsOpen && (
              <div className="options-dropdown">
                <button onClick={handleDelete}>Delete Post</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="post-content">
        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
          <a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key} className="post-link">
            {decoratedText}
          </a>
        )}>
          {post.content}
        </Linkify>
      </p>
      
      {post.imageUrl && (
        <div className="post-image-container">
            <img src={post.imageUrl} alt="Post image" className="post-image"/>
        </div>
      )}

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
