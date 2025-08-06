import React, { useState, useEffect } from 'react';
import { TranscriptItem } from '../types/transcript';
import { Moon, Sun } from 'lucide-react';

interface KeywordsBoardProps {
  currentTime: number;
  transcriptData: TranscriptItem[];
  isPlaying: boolean;
}

const KeywordsBoard: React.FC<KeywordsBoardProps> = ({ currentTime, transcriptData, isPlaying }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentSentenceId, setCurrentSentenceId] = useState<number | null>(null);
  const [typewriterActive, setTypewriterActive] = useState(false);

  // Get current transcript item
  const getCurrentSentence = () => {
    return transcriptData.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );
  };

  const currentSentence = getCurrentSentence();

  // Typewriter effect
  useEffect(() => {
    if (!currentSentence) {
      setDisplayedText('');
      setCurrentSentenceId(null);
      setTypewriterActive(false);
      return;
    }

    // If it's a new sentence, start typewriter effect
    if (currentSentence.id !== currentSentenceId) {
      setCurrentSentenceId(currentSentence.id);
      setDisplayedText('');
      setTypewriterActive(false);
      
      // Only start typewriter if video is playing
      if (isPlaying) {
        setTypewriterActive(true);
        const text = currentSentence.text;
        let index = 0;
        
        const typeWriter = () => {
          if (index < text.length && isPlaying) {
            setDisplayedText(text.slice(0, index + 1));
            index++;
            setTimeout(typeWriter, 30);
          } else if (!isPlaying) {
            setTypewriterActive(false);
          } else {
            setTypewriterActive(false);
          }
        };
        
        typeWriter();
      }
    }
  }, [currentSentence, currentSentenceId, isPlaying]);

  // Handle play/pause changes for existing sentence
  useEffect(() => {
    if (!currentSentence || currentSentence.id !== currentSentenceId) return;

    if (isPlaying && displayedText.length < currentSentence.text.length) {
      // Resume typewriter
      setTypewriterActive(true);
      const text = currentSentence.text;
      let index = displayedText.length;
      
      const typeWriter = () => {
        if (index < text.length && isPlaying) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 30);
        } else {
          setTypewriterActive(false);
        }
      };
      
      typeWriter();
    } else if (!isPlaying) {
      setTypewriterActive(false);
    }
  }, [isPlaying, currentSentence, currentSentenceId, displayedText.length]);

  // Highlight keywords in the displayed text
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

      {/* Current Speech Text with Typewriter Effect */}
      <div className="flex-1 flex items-center justify-center p-8">
        {currentSentence ? (
          <div className="text-center max-w-full">
            <p 
              className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium"
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(displayedText, currentSentence.keywords) + 
                       (typewriterActive && displayedText.length < currentSentence.text.length ? '<span class="animate-pulse">|</span>' : '')
              }}
            />
          </div>
        ) : (
          <div className="text-center">
            <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isPlaying ? 'Waiting for speech...' : 'Press play to start'}
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