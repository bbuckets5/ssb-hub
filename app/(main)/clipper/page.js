// app/(main)/clipper/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './ClipperPage.css';

export default function ClipperPage() {
  const [groupedVods, setGroupedVods] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentStreams = async () => {
      try {
        const res = await fetch('/api/streams/recent');
        if (!res.ok) {
          throw new Error('Failed to fetch recent streams.');
        }
        setGroupedVods(await res.json());
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
      <h1>Stream VODs (Last 5 Days)</h1>
      <p>Select a VOD to start clipping.</p>

      {isLoading && <p>Loading recent streams...</p>}
      {error && <p className="error-text">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="streamer-sections-container">
          {Object.keys(groupedVods).map(streamer => (
            groupedVods[streamer].length > 0 && (
              <section key={streamer} className="streamer-section">
                <h2 className={`streamer-name-title ${streamer.toLowerCase()}-text`}>
                  Recent Streams from {streamer}
                </h2>
                <div className="vod-row">
                  {groupedVods[streamer].map(vod => (
                    <Link key={vod.id} href={`/clipper/${vod.id}`} className="vod-card">
                      <div className="thumbnail-container">
                        <img src={vod.thumbnailUrl || '/placeholder-thumbnail.png'} alt={vod.title || 'Stream thumbnail'} className="vod-thumbnail" />
                        <span className="vod-duration">{formatDuration(vod.duration)}</span>
                      </div>
                      <div className="vod-info">
                        <h3 className="vod-title">{vod.title || 'Untitled Stream'}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
}
