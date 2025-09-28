// components/ClippingTool.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js'; // 1. Import the HLS.js library
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
        const vods = await res.json();
        const currentVod = vods.find(v => v.id.toString() === vodId);
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

  // --- 2. NEW: This useEffect handles loading the video with HLS.js ---
  useEffect(() => {
    if (videoRef.current && vod?.videoUrl && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(vod.videoUrl);
      hls.attachMedia(videoRef.current);
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current && vod?.videoUrl) {
      // Fallback for browsers that support HLS natively
      videoRef.current.src = vod.videoUrl;
    }
  }, [vod]); // This runs whenever the VOD data is loaded
  // ----------------------------------------------------------------

  const handleSetStart = () => {
    if (videoRef.current) setStartTime(Math.floor(videoRef.current.currentTime));
  };
  
  const handleSetEnd = () => {
    if (videoRef.current) setEndTime(Math.floor(videoRef.current.currentTime));
  };

  const handleRequestClip = async () => {
    // ... (This function remains the same)
  };

  const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

  if (isLoading) return <div className="clipper-container"><p>Loading VOD...</p></div>;
  if (error) return <div className="clipper-container"><p className="error-text">{error}</p></div>;

  return (
    <div className="clipper-container">
      <div className="video-player-column">
        {/* 3. The video tag itself no longer needs a src prop here */}
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
            <div className="time-box"><label>Start Time</label><span>{formatTime(startTime)}</span><button onClick={handleSetStart}>Set Start</button></div>
            <div className="time-box"><label>End Time</label><span>{formatTime(endTime)}</span><button onClick={handleSetEnd}>Set End</button></div>
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
