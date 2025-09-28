// components/CreatePost.js
'use client';

import { useState, useRef } from 'react';
import './CreatePost.css';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');

      // 1. Create a FormData object to send both text and a file
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      // 2. Send the FormData to the API
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          // IMPORTANT: Do NOT set the 'Content-Type' header.
          // The browser will automatically set it to 'multipart/form-data'
          // with the correct boundary when you send FormData.
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const newPost = await res.json();
      if (!res.ok) {
        throw new Error(newPost.message || 'Failed to create post.');
      }

      onPostCreated(newPost);
      // Reset the form completely
      setContent('');
      handleRemoveImage();

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
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
          accept="image/png, image/jpeg, image/gif"
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected preview" />
            <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
              &times;
            </button>
          </div>
        )}

        <div className="create-post-actions">
          <div className="action-icons">
            <button 
              type="button" 
              className="icon-button"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-image"></i>
            </button>
          </div>
          <button 
            type="submit" 
            className="cta-button" 
            disabled={(!content.trim() && !image) || isLoading}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}