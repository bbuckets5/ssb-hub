// components/ClippingTool.js
'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [endTime, setEndTime] = useState(30); // Default to a 30s clip
  const [aspectRatio, setAspectRatio] = useState('landscape');
  
  // State for FFmpeg processing
  const ffmpegRef = useRef(new FFmpeg());
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    // Load the FFmpeg engine
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        // You can show logs in the console if you want
        // console.log(message);
      });
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      });
      setIsFFmpegLoaded(true);
    };
    loadFFmpeg();

    // Fetch the VOD details
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
  
  const handleSetStart = () => {
    if (videoRef.current) setStartTime(Math.floor(videoRef.current.currentTime));
  };
  
  const handleSetEnd = () => {
    if (videoRef.current) setEndTime(Math.floor(videoRef.current.currentTime));
  };

  const handleCreateClip = async () => {
    if (!isFFmpegLoaded) {
      alert('FFmpeg is not loaded yet. Please wait.');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }

    setIsProcessing(true);
    setProgressMessage('Loading video file...');
    
    const ffmpeg = ffmpegRef.current;
    
    try {
      // 1. Fetch the video file and write it to FFmpeg's virtual memory
      await ffmpeg.writeFile('input.mp4', await fetchFile(vod.videoUrl));
      
      setProgressMessage('Trimming and formatting...');

      // 2. Build the FFmpeg command
      const command = [
        '-i', 'input.mp4',
        '-ss', formatTime(startTime),
        '-to', formatTime(endTime),
        '-c', 'copy', // Copy codecs to be fast
      ];

      // Add filter for portrait mode
      if (aspectRatio === 'portrait') {
        command.pop(); // Remove '-c copy' because we need to re-encode
        command.push('-vf', 'crop=ih*9/16:ih'); // Crop to a 9:16 aspect ratio from the center
      }
      command.push('output.mp4');

      // 3. Run the command
      await ffmpeg.exec(command);

      setProgressMessage('Preparing download...');

      // 4. Read the result
      const data = await ffmpeg.readFile('output.mp4');

      // 5. Create a URL and trigger the download
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'ssb-clip'}.mp4`;
      a.click();
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
        <video ref={videoRef} src={vod.videoUrl} controls className="main-video-player"></video>
      </div>
      <div className="controls-column">
        <div className="controls-wrapper glass">
          <h2>Create a Clip</h2>
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
            {isProcessing ? progressMessage : 'Create & Download Clip'}
          </button>
        </div>
      </div>
    </div>
  );
}
