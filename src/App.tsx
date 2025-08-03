import React from 'react';
import VideoPlayer from './components/VideoPlayer';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Learning Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interactive Video Experience with Real-time Transcription
          </p>
        </header>
        
        <VideoPlayer />
      </div>
    </div>
  );
}

export default App;