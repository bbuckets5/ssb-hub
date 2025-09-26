// app/(main)/live/page.js
'use client';

import { useState, useEffect } from 'react';
import StreamerSidebar from '@/components/StreamerSidebar'; // Import the new component
import './LivePage.css';

// This is our list of streamers for the sidebar
const ssbStreamers = [
  { name: 'Adin Ross', channel: 'adinross' },
  { name: 'Cheesur', channel: 'cheesur' },
  { name: 'Cuffem', channel: 'cuffem' },
  { name: 'Konvy', channel: 'konvy' },
  { name: 'N3on', channel: 'n3on' },
  // Add more here
];

// This is our map of communities to their main streamer
const communityStreamers = {
  ytg: 'cheesur',
  bau: 'cuffem',
  arl: 'adinross',
  ktf: 'konvy',
  shniggers: 'n3on',
};

export default function LivePage() {
  const [activeChannel, setActiveChannel] = useState('adinross'); // Default channel

  useEffect(() => {
    // Check which community the user has selected to set the initial stream
    const selectedCommunity = localStorage.getItem('selectedCommunity');
    const initialChannel = communityStreamers[selectedCommunity];

    if (initialChannel) {
      setActiveChannel(initialChannel);
    }
  }, []);

  return (
    <div className="live-page-container">
      <div className="stream-container">
        <div className="stream-wrapper">
          <iframe
            src={`https://player.kick.com/${activeChannel}`}
            className="stream-iframe"
            allowFullScreen={true}
          ></iframe>
        </div>
      </div>
      <StreamerSidebar
        streamers={ssbStreamers}
        activeStreamer={activeChannel}
        onSelectStreamer={setActiveChannel}
      />
    </div>
  );
}
