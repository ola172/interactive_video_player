

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
  }, [currentTime, transcriptData]);

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
    const sizes = ['text-4xl', 'text-5xl', 'text-6xl'];
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
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-12">
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
                  group-hover:scale-125
                  ${keyword.isWriting ? 'font-handwriting' : ''}
                  inline-block
                  origin-left
                `}
                style={{
                  wordSpacing: '0.5rem',
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
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
        {visibleKeywords.length} keywords
      </div>
    </div>
  );
};

export default KeywordsBoard;


//------------------------------------

// import React, { useState, useEffect } from 'react';
// import { TranscriptItem, KeywordItem } from '../types/transcript';
// import { Lightbulb } from 'lucide-react';

// interface KeywordsBoardProps {
//   currentTime: number;
//   transcriptData: TranscriptItem[];
// }

// interface KeywordState {
//   text: string;
//   appearedAt: number;
//   endTime: number;
//   isTyping: boolean;
//   displayedText: string;
//   isComplete: boolean;
//   isWriting: boolean;
//   shouldDisappear: boolean;
// }

// const KeywordsBoard: React.FC<KeywordsBoardProps> = ({
//   currentTime,
//   transcriptData,
// }) => {
//   const [keywords, setKeywords] = useState<KeywordState[]>([]);

//   // Faster typing speed constants
//   const BASE_TYPING_SPEED = 50; // Reduced from 100 (faster typing)
//   const RANDOMNESS = 30; // Reduced from 50 (less variation for more consistent speed)

//   // Get all keywords that should be visible at currentTime
//   useEffect(() => {
//     const visibleKeywords: KeywordState[] = [];
    
//     transcriptData.forEach(item => {
//       item.keywords.forEach(keyword => {
//         if (currentTime >= keyword.start && currentTime <= keyword.end + 2) {
//           if (!keywords.some(k => 
//             k.text === keyword.word && 
//             k.appearedAt === keyword.start
//           )) {
//             visibleKeywords.push({
//               text: keyword.word,
//               appearedAt: keyword.start,
//               endTime: keyword.end,
//               isTyping: true,
//               displayedText: '',
//               isComplete: false,
//               isWriting: true,
//               shouldDisappear: false
//             });
//           }
//         }
//       });
//     });

//     setKeywords(prev => [
//       ...prev.filter(k => currentTime <= k.endTime + 2),
//       ...visibleKeywords
//     ]);

//     setKeywords(prev => prev.map(k => ({
//       ...k,
//       shouldDisappear: currentTime > k.endTime + 2
//     })));
//   }, [currentTime, transcriptData]);

//   // Faster typewriter effect implementation
//   useEffect(() => {
//     const intervals: NodeJS.Timeout[] = [];

//     keywords.forEach(keyword => {
//       if (!keyword.shouldDisappear && keyword.isTyping && keyword.displayedText.length < keyword.text.length) {
//         const interval = setInterval(() => {
//           setKeywords(prev => prev.map(k => {
//             if (
//               k.text === keyword.text &&
//               k.appearedAt === keyword.appearedAt &&
//               k.displayedText.length < k.text.length
//             ) {
//               // Faster typing: sometimes add multiple characters at once
//               const charsToAdd = Math.random() > 0.7 ? 2 : 1; // 30% chance to add 2 chars
//               const newDisplayedText = k.text.substring(
//                 0, 
//                 Math.min(k.displayedText.length + charsToAdd, k.text.length)
//               );
//               const isComplete = newDisplayedText.length === k.text.length;

//               return {
//                 ...k,
//                 displayedText: newDisplayedText,
//                 isTyping: !isComplete,
//                 isComplete: isComplete,
//                 isWriting: !isComplete
//               };
//             }
//             return k;
//           }));
//         }, BASE_TYPING_SPEED + Math.random() * RANDOMNESS); // Faster overall typing

//         intervals.push(interval);
//       } else if (keyword.isComplete && keyword.isWriting) {
//         const timeout = setTimeout(() => {
//           setKeywords(prev => prev.map(k => 
//             k.text === keyword.text && k.appearedAt === keyword.appearedAt 
//               ? { ...k, isWriting: false } 
//               : k
//           ));
//         }, 2000);

//         intervals.push(timeout);
//       }
//     });

//     return () => {
//       intervals.forEach(interval => clearInterval(interval));
//     };
//   }, [keywords]);

//   const visibleKeywords = keywords.filter(k => !k.shouldDisappear);

//   return (
//     <div className="absolute inset-0 flex flex-col items-center pointer-events-none z-20">
//       <div className="relative z-10 w-full h-full flex flex-col">
//         <div className="flex items-center mb-4 justify-center pt-4">
//           <Lightbulb className="w-7 h-7 text-white drop-shadow-[0_1px_1.2px_rgba(0,0,0,0.8)] mr-2" />
//           <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_1.2px_rgba(0,0,0,0.8)]">
//             Key Concepts
//           </h3>
//         </div>
        
//         <div className="flex-1 flex flex-col items-center gap-4 overflow-y-auto custom-scrollbar pt-4">
//           {visibleKeywords.map((keyword) => (
//             <div 
//               key={`${keyword.text}-${keyword.appearedAt}-${keyword.endTime}`}
//               className="relative"
//             >
//               <span 
//                 className={`text-white font-bold text-3xl drop-shadow-[0_2px_1.2px_rgba(0,0,0,0.8)]
//                            ${keyword.isWriting ? 'font-handwriting tracking-wider' : ''}`}
//                 style={{
//                   fontVariationSettings: keyword.isWriting ? '"wght" 700' : 'normal',
//                   transition: 'all 0.1s ease-out' // Smoother visual changes
//                 }}
//               >
//                 {keyword.displayedText}
//                 {keyword.isTyping && (
//                   <span 
//                     className="animate-pulse ml-1 text-yellow-300"
//                     style={{ animationDuration: '0.5s' }} // Faster cursor blink
//                   >
//                     |
//                   </span>
//                 )}
//               </span>
              
//               {keyword.isWriting && (
//                 <div className="absolute -bottom-1 left-0 w-full h-1 overflow-hidden">
//                   <div 
//                     className="h-full bg-amber-400 rounded-full"
//                     style={{
//                       width: `${(keyword.displayedText.length / keyword.text.length) * 100}%`,
//                       transition: 'width 0.05s ease-out' // Faster progress bar
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
          
//           {visibleKeywords.length === 0 && (
//             <div className="w-full h-full flex items-center justify-center">
//               <div className="text-center">
//                 <Lightbulb className="w-16 h-16 mx-auto mb-4 text-white/50" />
//                 <p className="text-lg font-medium text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
//                   Keywords will appear as the avatar speaks
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
        
//         <div className="mt-4 pt-4">
//           <div className="flex items-center justify-between text-sm font-medium text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
//             <span>{visibleKeywords.length} active concepts</span>
//             <span>Fast handwriting effect</span> {/* Updated text */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KeywordsBoard;