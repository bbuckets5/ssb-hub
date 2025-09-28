// app/(main)/feed/page.js
'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';
import './FeedPage.css';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (res.ok) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  // --- NEW: Function to handle deleting a post from the feed ---
  const handleDeletePost = (postId) => {
    setPosts(currentPosts => currentPosts.filter(p => p._id !== postId));
  };

  return (
    <div className="feed-page-container">
      {isLoggedIn && <CreatePost onPostCreated={handleCreatePost} />}

      <div className="timeline">
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</p>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onPostDeleted={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
}
