// components/Homepage.js

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Homepage.css';

export default function Homepage() {
  const router = useRouter();

  // --- NEW: This useEffect cleans up the theme for new/logged-out visitors ---
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // If no one is logged in, make sure no theme is applied
      localStorage.removeItem('selectedCommunity');
      document.body.className = '';
    }
  }, []);
  // --------------------------------------------------------------------------

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { currentTarget: target } = e;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.style.setProperty("--mouse-x", `${x}px`);
      target.style.setProperty("--mouse-y", `${y}px`);
    };

    for (const card of document.querySelectorAll(".community-card")) {
      card.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      for (const card of document.querySelectorAll(".community-card")) {
        card.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  const handleCommunitySelect = (communityName) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      localStorage.setItem('selectedCommunity', communityName);
      router.push('/feed');
    } else {
      router.push(`/signup?community=${communityName}`);
    }
  };

  return (
    <div className="homepage-container">
      <div className="grid-background"></div>

      <div onClick={() => handleCommunitySelect('ytg')} className="community-card ytg">
        <div className="card-content"><h2>YTG</h2></div>
      </div>
      <div onClick={() => handleCommunitySelect('bau')} className="community-card bau">
        <div className="card-content"><h2>BAU</h2></div>
      </div>
      <div onClick={() => handleCommunitySelect('arl')} className="community-card arl">
        <div className="card-content"><h2>ARL</h2></div>
      </div>
      <div onClick={() => handleCommunitySelect('ktf')} className="community-card ktf">
        <div className="card-content"><h2>KTF</h2></div>
      </div>
      <div onClick={() => handleCommunitySelect('shniggers')} className="community-card shniggers">
        <div className="card-content"><h2>SHNIGGERS</h2></div>
      </div>
    </div>
  );
}
