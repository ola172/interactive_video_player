import React, { useState, useRef, useEffect } from 'react';
import TranscriptViewer from './TranscriptViewer';
import KeywordsBoard from './KeywordsBoard';
import FileUploader from './FileUploader';
import { Play, Pause, Volume2, PanelLeftOpen, PanelLeftClose, Upload } from 'lucide-react';
import { transcriptData } from '../data/transcriptData';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showBoard, setShowBoard] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [currentTranscript, setCurrentTranscript] = useState(transcriptData);

  // Video control handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial properties
    video.volume = volume;
    video.muted = false;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleLoadedData = () => setIsLoading(false);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [volume]);

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setIsLoading(true);
      if (isPlaying) {
        video.pause();
        setIsLoading(false);
      } else {
        await video.play();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setIsLoading(false);
      // Try to play with user interaction
      if (!isPlaying) {
        try {
          video.muted = true;
          await video.play();
        } catch (mutedError) {
          console.error('Error playing muted video:', mutedError);
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
  };

  const handleSeekFromBoard = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setCurrentVideoUrl(url);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleTranscriptUpload = (transcript: any[]) => {
    setCurrentTranscript(transcript);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Video + Board Container */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="flex flex-row bg-white">
          {/* Video Player */}
          <div className={`${showBoard ? 'w-[30%]' : 'w-full'} relative z-0 bg-black transition-all duration-300`}>
            <video
              ref={videoRef}
              className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] object-cover"
              poster="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1200"
              preload="auto"
              playsInline
              muted
              controls={false}
            >
              <source src={currentVideoUrl} type="video/mp4" />
              <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex items-center space-x-3 text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-lg font-medium">Loading video...</span>
                </div>
              </div>
            )}

            {/* Enhanced Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2">
                <button
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-full transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex items-center space-x-3">
                  <span className="text-white text-sm font-medium min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="flex-1 relative h-2 group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      disabled={isLoading}
                      className="absolute w-full h-full opacity-0 z-20 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="absolute w-full h-full bg-gray-600/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-white text-sm font-medium min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>

                <button 
                  onClick={() => setShowUploader(true)}
                  className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Upload video and transcript"
                >
                  <Upload className="w-5 h-5 text-white" />
                </button>

                <button 
                  onClick={() => setShowBoard(!showBoard)}
                  className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Toggle keywords board"
                >
                  {showBoard ? (
                    <PanelLeftClose className="w-5 h-5 text-white" />
                  ) : (
                    <PanelLeftOpen className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Keywords Board */}
          {showBoard && (
            <div className="w-[70%] h-[50vh] md:h-[60vh] lg:h-[70vh] bg-white border-l border-gray-200 relative z-10">
              <KeywordsBoard 
                currentTime={currentTime} 
                transcriptData={currentTranscript}
                isPlaying={isPlaying}
              />
            </div>
          )}
        </div>
      </div>

      {/* Transcript Section */}
      <TranscriptViewer currentTime={currentTime} transcriptData={currentTranscript} />

      {/* File Uploader Modal */}
      <FileUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onVideoUrlChange={handleVideoUrlChange}
        onTranscriptUpload={handleTranscriptUpload}
      />
    </div>
  );
};

export default VideoPlayer;