// components/ClippingTool.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './ClippingTool.css';

export default function ClippingTool({ vodId }) {
  const [vod, setVod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVodDetails = async () => {
      try {
        const res = await fetch('/api/streams/recent');
        if (!res.ok) throw new Error('Could not fetch VODs');
        
        // --- MODIFIED: Correctly handle the grouped data structure ---
        const groupedVods = await res.json();
        const allVods = Object.values(groupedVods).flat(); // Combine all vods into one array
        const currentVod = allVods.find(v => v.id.toString() === vodId);
        // -----------------------------------------------------------

        if (!currentVod) throw new Error('VOD not found.');
        setVod(currentVod);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVodDetails();
  }, [vodId]);

  useEffect(() => {
    if (videoRef.current && vod?.videoUrl && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(vod.videoUrl);
      hls.attachMedia(videoRef.current);
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current && vod?.videoUrl) {
      videoRef.current.src = vod.videoUrl;
    }
  }, [vod]);

  const handleSetStart = () => {
    if (videoRef.current) setStartTime(Math.floor(videoRef.current.currentTime));
  };
  
  const handleSetEnd = () => {
    if (videoRef.current) setEndTime(Math.floor(videoRef.current.currentTime));
  };

  const handleRequestClip = async () => {
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }
    if (!title.trim()) {
      alert('Please provide a title for your clip.');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('You must be logged in to request a clip.');

      const res = await fetch('/api/clipper/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vodId: vod.id,
          title,
          startTime,
          endTime,
          videoUrl: vod.videoUrl,
          streamer: vod.streamer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('Clip request sent successfully!');
      setTitle('');
      
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

  if (isLoading) return <div className="clipper-container"><p>Loading VOD...</p></div>;
  if (error) return <div className="clipper-container"><p className="error-text">{error}</p></div>;

  return (
    <div className="clipper-container">
      <div className="video-player-column">
        <video ref={videoRef} controls className="main-video-player"></video>
      </div>
      <div className="controls-column">
        <div className="controls-wrapper glass">
          <h2>Create a Clip Request</h2>
          <div className="form-group">
            <label htmlFor="clipTitle">Clip Title</label>
            <input 
              type="text" 
              id="clipTitle" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Funny moment, epic play, etc."
            />
          </div>
          <div className="time-controls">
            <div className="time-box">
              <label>Start Time</label>
              <span>{formatTime(startTime)}</span>
              <button onClick={handleSetStart}>Set Start</button>
            </div>
            <div className="time-box">
              <label>End Time</label>
              <span>{formatTime(endTime)}</span>
              <button onClick={handleSetEnd}>Set End</button>
            </div>
          </div>
          <button className="cta-button" onClick={handleRequestClip} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Request Clip'}
          </button>
          {message && <p style={{textAlign: 'center', marginTop: '1rem'}}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
