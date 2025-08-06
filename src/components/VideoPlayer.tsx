
import React, { useState, useRef, useEffect } from 'react';
import TranscriptViewer from './TranscriptViewer';
import KeywordsBoard from './KeywordsBoard';
import { Play, Pause, Volume2, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { transcriptData } from '../data/transcriptData';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showBoard, setShowBoard] = useState(true);
  const [volume, setVolume] = useState(0.7);

  // Video control handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
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
    isPlaying ? video.pause() : video.play();
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
          {/* Video Player (80% width) */}
          <div className={`${showBoard ? 'w-[70%]' : 'w-full'} relative z-0 bg-black transition-all duration-300`}>
            <video
              ref={videoRef}
              className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] object-cover"
              poster="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=800"
              volume={volume}
            >
              <source src="https://files2.heygen.ai/aws_pacific/avatar_tmp/496eec5fcb694ca6b7a598c6815d6fd5/500b656561814ff2aac67549fd27ae18.mp4?Expires=1754476164&Signature=N5eCkhjcmx9PddjTt4fjr72b4TgHVSWyT3GqrQcIvO0vlN6Zf2en3e3noOfCq1YfnWPtUaEKpqhoSmzBAHfTYn~IkYqdm159eZiyZuPS2BPxw8Vu~zZACPuKgiTwr8u6LtN6ZDV4tQa8QYWbJGfAeciKdKCiVtsGdIyKWGC5uGDorlu9vaKAaIxPI79ht6qDm3LZtxyfcHtb39rWiETER~YxIgVp2LSzArdA8JnCwNv6SftqybPW0PgVqYwUi7tq73vIfUpcKNJ2ZWQbAFE-MXYzRDiCHBipAB3-zGpfYGcYvfBud6BG3hP632HOb8HDYSFFVSdQWWoBf-5MeFPFEw__&Key-Pair-Id=K38HBHX5LX3X2H" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Enhanced Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200"
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
                      className="absolute w-full h-full opacity-0 z-20 cursor-pointer"
                    />
                    <div className="absolute w-full h-full bg-gray-600/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                      <div 
                        className="absolute top-0 h-full bg-blue-400/50 rounded-full"
                        style={{ 
                          width: `${progress}%`,
                          transform: 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.2s ease-out',
                          willChange: 'transform'
                        }}
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
                  onClick={() => setShowBoard(!showBoard)}
                  className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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

          {/* Interactive Keywords Board (20% width) */}
          {showBoard && (
            <div className="w-[30%] h-[50vh] md:h-[60vh] lg:h-[70vh] bg-white border-l border-gray-200 relative z-10">
              <KeywordsBoard 
                currentTime={currentTime} 
                transcriptData={transcriptData}
                onSeek={(time) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = time;
                    if (!isPlaying) videoRef.current.play();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Transcript Section */}
      <TranscriptViewer currentTime={currentTime} transcriptData={transcriptData} />
     </div>
   );
 };

 export default VideoPlayer;

//-----------------------------------------------------------------

// import React, { useState, useRef, useEffect } from 'react';
// import TranscriptViewer from './TranscriptViewer';
// import KeywordsBoard from './KeywordsBoard';
// import { Play, Pause, Volume2 } from 'lucide-react';
// import { transcriptData } from '../data/transcriptData';

// const VideoPlayer: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const handleTimeUpdate = () => {
//       setCurrentTime(video.currentTime);
//     };

//     const handleLoadedMetadata = () => {
//       setDuration(video.duration);
//     };

//     const handlePlay = () => setIsPlaying(true);
//     const handlePause = () => setIsPlaying(false);

//     video.addEventListener('timeupdate', handleTimeUpdate);
//     video.addEventListener('loadedmetadata', handleLoadedMetadata);
//     video.addEventListener('play', handlePlay);
//     video.addEventListener('pause', handlePause);

//     return () => {
//       video.removeEventListener('timeupdate', handleTimeUpdate);
//       video.removeEventListener('loadedmetadata', handleLoadedMetadata);
//       video.removeEventListener('play', handlePlay);
//       video.removeEventListener('pause', handlePause);
//     };
//   }, []);

//   const togglePlayPause = () => {
//     const video = videoRef.current;
//     if (!video) return;

//     if (isPlaying) {
//       video.pause();
//     } else {
//       video.play();
//     }
//   };

//   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const video = videoRef.current;
//     if (!video) return;

//     const seekTime = (parseFloat(e.target.value) / 100) * duration;
//     video.currentTime = seekTime;
//     setCurrentTime(seekTime);
//   };

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

//   return (
//   <div className="max-w-7xl mx-auto">
//     {/* Video Section - Restructured */}
//     <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
//       {/* Single container for video + overlay */}
//       <div className="relative bg-black">
//         {/* Video Player - now full width */}
//         <video
//           ref={videoRef}
//           className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] object-cover"
//           poster="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=800"
//         >
//           <source src="https://files2.heygen.ai/aws_pacific/avatar_tmp/496eec5fcb694ca6b7a598c6815d6fd5/500b656561814ff2aac67549fd27ae18.mp4?Expires=1754476164&Signature=N5eCkhjcmx9PddjTt4fjr72b4TgHVSWyT3GqrQcIvO0vlN6Zf2en3e3noOfCq1YfnWPtUaEKpqhoSmzBAHfTYn~IkYqdm159eZiyZuPS2BPxw8Vu~zZACPuKgiTwr8u6LtN6ZDV4tQa8QYWbJGfAeciKdKCiVtsGdIyKWGC5uGDorlu9vaKAaIxPI79ht6qDm3LZtxyfcHtb39rWiETER~YxIgVp2LSzArdA8JnCwNv6SftqybPW0PgVqYwUi7tq73vIfUpcKNJ2ZWQbAFE-MXYzRDiCHBipAB3-zGpfYGcYvfBud6BG3hP632HOb8HDYSFFVSdQWWoBf-5MeFPFEw__&Key-Pair-Id=K38HBHX5LX3X2H" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
        
//         {/* Video Controls Overlay */}
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={togglePlayPause}
//               className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200"
//             >
//               {isPlaying ? (
//                 <Pause className="w-6 h-6 text-white" />
//               ) : (
//                 <Play className="w-6 h-6 text-white ml-1" />
//               )}
//             </button>
            
//             <div className="flex-1 flex items-center space-x-3">
//               <span className="text-white text-sm font-medium">
//                 {formatTime(currentTime)}
//               </span>
              
//               <div className="flex-1 relative">
//                 <input
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={progress}
//                   onChange={handleSeek}
//                   className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
//                 />
//               </div>
              
//               <span className="text-white text-sm font-medium">
//                 {formatTime(duration)}
//               </span>
//             </div>
            
//             <Volume2 className="w-6 h-6 text-white" />
//           </div>
//         </div>

//         {/* Keywords Board Overlay - now positioned on video */}
//         <div className="absolute top-0 right-0 h-full w-[30%] pointer-events-none">
//           <KeywordsBoard currentTime={currentTime} transcriptData={transcriptData} />
//         </div>
//       </div>
//     </div>
    
//     {/* Transcript Section */}
//     <TranscriptViewer currentTime={currentTime} transcriptData={transcriptData} />
//   </div>
// );
// };

// export default VideoPlayer;