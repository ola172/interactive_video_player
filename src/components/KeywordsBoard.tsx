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
  const [isTyping, setIsTyping] = useState(false);

  // Get current transcript item
  const getCurrentSentence = () => {
    return transcriptData.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );
  };

  const currentSentence = getCurrentSentence();

  // Typewriter effect that only works when video is playing
  useEffect(() => {
    if (!currentSentence) {
      setDisplayedText('');
      setCurrentSentenceId(null);
      setIsTyping(false);
      return;
    }

    // If it's a new sentence, start fresh
    if (currentSentence.id !== currentSentenceId) {
      setCurrentSentenceId(currentSentence.id);
      setDisplayedText('');
      setIsTyping(false);
      
      // Only start typing if video is playing
      if (isPlaying) {
        startTypewriter(currentSentence.text);
      }
    }
  }, [currentSentence?.id, isPlaying]);

  // Handle play/pause for current sentence
  useEffect(() => {
    if (!currentSentence || currentSentence.id !== currentSentenceId) return;

    if (isPlaying && displayedText.length < currentSentence.text.length) {
      // Resume typewriter from where it left off
      startTypewriter(currentSentence.text, displayedText.length);
    } else if (!isPlaying) {
      setIsTyping(false);
    }
  }, [isPlaying]);

  const startTypewriter = (text: string, startIndex: number = 0) => {
    setIsTyping(true);
    let index = startIndex;
    
    const typeNextChar = () => {
      if (index < text.length && isPlaying) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        setTimeout(typeNextChar, 50); // 50ms per character
      } else {
        setIsTyping(false);
      }
    };
    
    typeNextChar();
  };

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

  const getDisplayContent = () => {
    if (!isPlaying) {
      return '<span class="text-gray-500">Press play to start</span>';
    }
    
    if (!currentSentence) {
      return '<span class="text-gray-500">Waiting for speech...</span>';
    }

    const highlightedText = highlightKeywords(displayedText, currentSentence.keywords);
    const cursor = isTyping ? '<span class="animate-pulse text-blue-500">|</span>' : '';
    
    return highlightedText + cursor;
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
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Current Speech Text with Typewriter Effect */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-full">
          <p 
            className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium"
            dangerouslySetInnerHTML={{
              __html: getDisplayContent()
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KeywordsBoard;