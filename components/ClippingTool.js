// components/ClippingTool.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './ClippingTool.css';

export default function ClippingTool({ vodId }) {
  const [vod, setVod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('landscape');
  
  const ffmpegRef = useRef(new FFmpeg());
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {});
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsFFmpegLoaded(true);
    };
    loadFFmpeg();

    const fetchVodDetails = async () => {
      try {
        const res = await fetch('/api/streams/recent');
        if (!res.ok) throw new Error('Could not fetch VODs');
        const groupedVods = await res.json();
        const allVods = Object.values(groupedVods).flat();
        const currentVod = allVods.find(v => v.id.toString() === vodId);
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
      return () => hls.destroy();
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

  const handleCreateClip = async () => {
    if (!isFFmpegLoaded) {
      alert('Clipping engine is still loading. Please wait a moment.');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }

    setIsProcessing(true);
    const ffmpeg = ffmpegRef.current;
    
    try {
      setProgressMessage('Loading video file via proxy...');
      
      // --- MODIFIED: Use our proxy API to fetch the video file ---
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(vod.videoUrl)}`;
      await ffmpeg.writeFile('input.mp4', await fetchFile(proxyUrl));
      // -----------------------------------------------------------
      
      setProgressMessage('Trimming and formatting...');
      
      const command = [
        '-i', 'input.mp4',
        '-ss', formatTime(startTime),
        '-to', formatTime(endTime),
        '-c:v', 'libx264',
        '-preset', 'superfast',
      ];

      if (aspectRatio === 'portrait') {
        command.push('-vf', 'crop=ih*9/16:ih');
      }
      command.push('output.mp4');

      await ffmpeg.exec(command);
      setProgressMessage('Preparing download...');
      const data = await ffmpeg.readFile('output.mp4');

      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.trim().replace(/ /g, '_') || 'ssb-clip'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch(err) {
      console.error(err);
      alert('An error occurred while creating the clip.');
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
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
          <h2>Create & Download Clip</h2>
          <div className="form-group">
            <label htmlFor="clipTitle">Clip Title</label>
            <input type="text" id="clipTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Funny moment, epic play, etc." />
          </div>
          <div className="time-controls">
            <div className="time-box"><label>Start Time</label><span>{formatTime(startTime)}</span><button onClick={handleSetStart}>Set Start</button></div>
            <div className="time-box"><label>End Time</label><span>{formatTime(endTime)}</span><button onClick={handleSetEnd}>Set End</button></div>
          </div>
          <div className="form-group">
            <label>Aspect Ratio</label>
            <div className="aspect-ratio-buttons">
              <button className={aspectRatio === 'landscape' ? 'active' : ''} onClick={() => setAspectRatio('landscape')}>Landscape</button>
              <button className={aspectRatio === 'portrait' ? 'active' : ''} onClick={() => setAspectRatio('portrait')}>Portrait</button>
            </div>
          </div>
          <button className="cta-button" onClick={handleCreateClip} disabled={isProcessing || !isFFmpegLoaded}>
            {isProcessing ? progressMessage : (isFFmpegLoaded ? 'Create & Download Clip' : 'Loading Engine...')}
          </button>
        </div>
      </div>
    </div>
  );
}
