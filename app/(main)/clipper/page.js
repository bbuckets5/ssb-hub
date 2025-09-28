// app/(main)/clipper/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './ClipperPage.css';

export default function ClipperPage() {
  const [vods, setVods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentStreams = async () => {
      try {
        const res = await fetch('/api/streams/recent');
        if (!res.ok) {
          throw new Error('Failed to fetch recent streams.');
        }
        setVods(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentStreams();
  }, []);

  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="clipper-page-container">
      <h1>Recent Streams (Last 5 Days)</h1>
      <p>Select a VOD to start clipping.</p>

      {isLoading && <p>Loading recent streams...</p>}
      {error && <p className="error-text">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="vod-grid">
          {vods.length === 0 ? (
            <p>No recent streams found.</p>
          ) : (
            vods.map(vod => {
              // --- MODIFIED: Added a safety check for the streamer name ---
              const streamerClass = vod.streamer ? `${vod.streamer.toLowerCase()}-text` : '';

              return (
                <Link key={vod.id} href={`/clipper/${vod.id}`} className="vod-card">
                  <div className="thumbnail-container">
                    <img src={vod.thumbnailUrl} alt={vod.title || 'Stream thumbnail'} className="vod-thumbnail" />
                    <span className="vod-duration">{formatDuration(vod.duration)}</span>
                  </div>
                  <div className="vod-info">
                    <h3 className="vod-title">{vod.title || 'Untitled Stream'}</h3>
                    {/* --- MODIFIED: Added a fallback for the streamer name --- */}
                    <p className={`streamer-name ${streamerClass}`}>
                      {vod.streamer || 'Unknown Streamer'}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  );
}
