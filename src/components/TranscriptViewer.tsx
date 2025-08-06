import React from 'react';
import { TranscriptItem } from '../types/transcript';

interface TranscriptViewerProps {
  currentTime: number;
  transcriptData: TranscriptItem[];
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  currentTime,
  transcriptData,
}) => {
  const getCurrentSentence = () => {
    return transcriptData.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );
  };

  const currentSentence = getCurrentSentence();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse shadow-lg"></span>
        Live Transcript
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {transcriptData.map((item, index) => {
          const isActive = currentSentence?.id === item.id;
          const isPast = currentTime > item.endTime;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl transition-all duration-500 border ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg transform scale-[1.01] ring-2 ring-blue-200/50'
                  : isPast
                  ? 'bg-gray-50/50 text-gray-500 border-gray-100'
                  : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className={`inline-block w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                      : isPast
                      ? 'bg-gray-400 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {Math.floor(item.startTime / 60)}:{String(Math.floor(item.startTime % 60)).padStart(2, '0')}
                    </span>
                    {isActive && (
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full font-medium shadow-sm">
                        Speaking now
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-base leading-relaxed ${
                    isActive ? 'font-semibold text-gray-900' : ''
                  }`}>
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptViewer;