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
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }

    // Fetch posts from the database
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

  // This function is called by the CreatePost component after a successful API call
  const handleCreatePost = (newPost) => {
    // Add the new post returned from the API to the top of the feed
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="feed-page-container">
      {/* Only show the CreatePost box if the user is logged in */}
      {isLoggedIn && <CreatePost onPostCreated={handleCreatePost} />}

      <div className="timeline">
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</p>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
