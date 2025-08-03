import React, { useState, useRef, useEffect } from 'react';
import TranscriptViewer from './TranscriptViewer';
import KeywordsBoard from './KeywordsBoard';
import { Play, Pause, Volume2 } from 'lucide-react';
import { transcriptData } from '../data/transcriptData';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Video Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="flex flex-col lg:flex-row">
          {/* Video Player */}
          <div className="lg:w-[70%] relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-64 md:h-80 lg:h-[500px] object-cover"
              poster="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=800"
            >
              <source src="https://st60377.ispot.cc/rawmaterials/course/5987_5_Conclusion_and_Future_Outlook_Leading_in_the_Digital_Age.m4v" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>
                
                <div className="flex-1 flex items-center space-x-3">
                  <span className="text-white text-sm font-medium">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  <span className="text-white text-sm font-medium">
                    {formatTime(duration)}
                  </span>
                </div>
                
                <Volume2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          {/* Keywords Whiteboard */}
          <div className="lg:w-[30%] relative">
            <KeywordsBoard currentTime={currentTime} transcriptData={transcriptData} />
          </div>
        </div>
      </div>
      
      {/* Transcript Section */}
      <TranscriptViewer currentTime={currentTime} transcriptData={transcriptData} />
    </div>
  );
};

export default VideoPlayer;