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
  endTime: number;
  isTyping: boolean;
  displayedText: string;
  isComplete: boolean;
  isWriting: boolean;
  shouldDisappear: boolean;
  importance: number;
  id: string;
}

const KeywordsBoard: React.FC<KeywordsBoardProps> = ({ currentTime, transcriptData }) => {
  const [keywords, setKeywords] = useState<KeywordState[]>([]);

  // Keyword management
  useEffect(() => {
    const newKeywords: KeywordState[] = [];
    
    transcriptData?.forEach(item => {
      item.keywords?.forEach(keyword => {
        if (currentTime >= keyword.start && currentTime <= keyword.end + 2) {
          const exists = keywords.some(k => 
            k.text === keyword.word && k.appearedAt === keyword.start
          );
          
          if (!exists) {
            newKeywords.push({
              text: keyword.word,
              appearedAt: keyword.start,
              endTime: keyword.end,
              isTyping: true,
              displayedText: '',
              isComplete: false,
              isWriting: true,
              shouldDisappear: false,
              importance: Math.min(2, Math.floor(Math.random() * 3)),
              id: `${keyword.word}-${keyword.start}-${Date.now()}`
            });
          }
        }
      });
    });

    if (newKeywords.length > 0) {
      setKeywords(prev => [
        ...prev.filter(k => currentTime <= k.endTime + 2),
        ...newKeywords
      ]);
    }

    setKeywords(prev => 
      prev.map(k => ({
        ...k,
        shouldDisappear: currentTime > k.endTime + 2
      })).filter(k => !k.shouldDisappear)
    );
  }, [currentTime, transcriptData, keywords]);

  // Typing effect
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    keywords.forEach(keyword => {
      if (keyword.isTyping && keyword.displayedText.length < keyword.text.length) {
        const interval = setInterval(() => {
          setKeywords(prev => prev.map(k => {
            if (k.id === keyword.id && k.displayedText.length < k.text.length) {
              const charsToAdd = Math.random() > 0.7 ? 2 : 1;
              const newDisplayedText = k.text.substring(
                0, Math.min(k.displayedText.length + charsToAdd, k.text.length)
              );
              const isComplete = newDisplayedText.length === k.text.length;

              return {
                ...k,
                displayedText: newDisplayedText,
                isTyping: !isComplete,
                isComplete,
                isWriting: !isComplete
              };
            }
            return k;
          }));
        }, 50 + Math.random() * 30);

        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [keywords]);

  const getBaseSize = (importance: number) => {
    const sizes = ['text-2xl', 'text-3xl', 'text-4xl'];
    return sizes[Math.min(importance, sizes.length - 1)];
  };

  const visibleKeywords = keywords.filter(k => !k.shouldDisappear);

  return (
    <div className="h-full w-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-gray-200">
        <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Key Concepts</h3>
      </div>

      {/* Keywords List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-8">
          {visibleKeywords.map((keyword) => (
            <div 
              key={keyword.id}
              className="group"
            >
              <span 
                className={`
                  ${getBaseSize(keyword.importance)}
                  font-bold text-gray-800
                  transition-all duration-300 ease-out
                  group-hover:scale-105
                  ${keyword.isWriting ? 'font-mono' : ''}
                  inline-block
                  origin-left
                `}
                style={{
                  wordSpacing: '0.3rem',
                  letterSpacing: keyword.isWriting ? '0.1rem' : '0.05rem',
                  lineHeight: '1.2'
                }}
              >
                {keyword.displayedText}
                {keyword.isTyping && (
                  <span className="ml-1 text-blue-400 animate-pulse">|</span>
                )}
              </span>
            </div>
          ))}
          
          {visibleKeywords.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">
                  Keywords will appear as the video plays
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
        {visibleKeywords.length} active concepts
      </div>
    </div>
  );
};

export default KeywordsBoard;