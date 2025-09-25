// app/(main)/live/page.js
'use client';

import { useState, useEffect } from 'react';
import './LivePage.css';

// This is our map of communities to streamer channels
const communityStreamers = {
  ytg: 'cheesur',
  bau: 'cuffem',
  arl: 'adinross',
  ktf: 'konvy',
  shniggers: 'n3on',
  // We can add more here later
};

export default function LivePage() {
  const [streamerChannel, setStreamerChannel] = useState(''); // Start with no channel

  useEffect(() => {
    // Check which community the user has selected
    const selectedCommunity = localStorage.getItem('selectedCommunity');
    
    // Find the correct streamer from our map
    const channel = communityStreamers[selectedCommunity];

    if (channel) {
      setStreamerChannel(channel);
    } else {
      // If no community is chosen or it's not in our map,
      // you can set a default or leave it blank
      setStreamerChannel('adinross'); // Default to a main streamer
    }
  }, []);

  return (
    <div className="live-page-container">
      <div className="stream-wrapper">
        {streamerChannel ? (
          <iframe
            src={`https://player.kick.com/${streamerChannel}`}
            className="stream-iframe"
            allowFullScreen={true}
          ></iframe>
        ) : (
          <div className="no-stream">
            <p>Select a community from the homepage to view a stream.</p>
          </div>
        )}
      </div>
    </div>
  );
}
