// components/StreamerSidebar.js
'use client';

import './StreamerSidebar.css';

export default function StreamerSidebar({ streamers, activeStreamer, onSelectStreamer }) {
  return (
    <div className="streamer-sidebar">
      <h3 className="sidebar-title">Who's Live</h3>
      <ul className="streamer-list">
        {streamers.map((streamer) => (
          <li key={streamer.channel}>
            <button 
              className={`streamer-button ${activeStreamer === streamer.channel ? 'active' : ''}`}
              onClick={() => onSelectStreamer(streamer.channel)}
            >
              {streamer.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
