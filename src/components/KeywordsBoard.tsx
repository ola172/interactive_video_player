import React, { useState, useEffect } from 'react';
import { TranscriptItem } from '../types/transcript';
import { Lightbulb } from 'lucide-react';

interface KeywordsBoardProps {
  currentTime: number;
  transcriptData: TranscriptItem[];
}

interface KeywordState {
  text: string;
  appearedAt: number;
  isTyping: boolean;
  displayedText: string;
  isComplete: boolean;
}

const KeywordsBoard: React.FC<KeywordsBoardProps> = ({
  currentTime,
  transcriptData,
}) => {
  const [keywords, setKeywords] = useState<KeywordState[]>([]);

  // Get currently speaking keywords
  const getCurrentKeywords = () => {
    const currentItem = transcriptData.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );
    return currentItem?.keywords || [];
  };

  useEffect(() => {
    const currentKeywords = getCurrentKeywords();
    
    // Add new keywords with typewriter effect
    currentKeywords.forEach(keyword => {
      const exists = keywords.find(k => k.text === keyword);
      if (!exists) {
        setKeywords(prev => [...prev, {
          text: keyword,
          appearedAt: currentTime,
          isTyping: true,
          displayedText: '',
          isComplete: false
        }]);
      }
    });
  }, [currentTime]);

  // Typewriter effect for each keyword
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    keywords.forEach((keyword, index) => {
      if (keyword.isTyping && keyword.displayedText.length < keyword.text.length) {
        const interval = setInterval(() => {
          setKeywords(prev => prev.map((k, i) => {
            if (i === index && k.displayedText.length < k.text.length) {
              const nextChar = k.text[k.displayedText.length];
              const newDisplayedText = k.displayedText + nextChar;
              const isComplete = newDisplayedText.length === k.text.length;
              
              return {
                ...k,
                displayedText: newDisplayedText,
                isTyping: !isComplete,
                isComplete: isComplete
              };
            }
            return k;
          }));
        }, 100); // Typing speed

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [keywords]);

  // Remove completed keywords after a short delay
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    keywords.forEach((keyword, index) => {
      if (keyword.isComplete && !keyword.isTyping) {
        const timeout = setTimeout(() => {
          setKeywords(prev => prev.filter((_, i) => i !== index));
        }, 2000); // Keep visible for 2 seconds after typing completes

        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [keywords]);

  return (
    <div className="h-64 md:h-80 lg:h-96 bg-white/90 backdrop-blur-sm border-l border-gray-200/50 p-6 flex flex-col relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #6B7280 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Key Concepts</h3>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-wrap content-start gap-3 overflow-y-auto custom-scrollbar">
            {keywords.map((keyword, index) => (
              <div
                key={`${keyword.text}-${keyword.appearedAt}`}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 animate-typewriter-appear"
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                <span className="font-medium text-sm">
                  {keyword.displayedText}
                  {keyword.isTyping && (
                    <span className="animate-pulse ml-1 text-yellow-300">|</span>
                  )}
                </span>
              </div>
            ))}
            
            {keywords.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Keywords will appear as the avatar speaks</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{keywords.length} active concepts</span>
            <span>Typewriter effect active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordsBoard;