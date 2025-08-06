import React, { useState } from 'react';
import { TranscriptItem } from '../types/transcript';
import { Moon, Sun } from 'lucide-react';

interface KeywordsBoardProps {
  currentTime: number;
  transcriptData: TranscriptItem[];
}

const KeywordsBoard: React.FC<KeywordsBoardProps> = ({ currentTime, transcriptData }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get current transcript item
  const getCurrentSentence = () => {
    return transcriptData.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );
  };

  const currentSentence = getCurrentSentence();

  // Highlight keywords in the current text
  const highlightKeywords = (text: string, keywords: any[]) => {
    if (!keywords || keywords.length === 0) return text;

    let highlightedText = text;
    
    // Sort keywords by length (longest first) to avoid partial replacements
    const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);
    
    sortedKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark class="keyword-highlight">$&</mark>`);
    });

    return highlightedText;
  };

  const themeClasses = {
    container: isDarkMode 
      ? 'bg-gray-900 text-white' 
      : 'bg-white text-gray-900',
    modeButton: isDarkMode
      ? 'bg-gray-800 hover:bg-gray-700 text-white'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
  };

  return (
    <div className={`h-full w-full flex flex-col ${themeClasses.container} relative`}>
      {/* Mode Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 ${themeClasses.modeButton}`}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Current Speech Text */}
      <div className="flex-1 flex items-center justify-center p-8">
        {currentSentence ? (
          <div className="text-center max-w-full">
            <p 
              className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium"
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(currentSentence.text, currentSentence.keywords)
              }}
            />
          </div>
        ) : (
          <div className="text-center">
            <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Speech will appear here as the video plays
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .keyword-highlight {
          background: linear-gradient(120deg, #3B82F6 0%, #8B5CF6 100%);
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
};

export default KeywordsBoard;