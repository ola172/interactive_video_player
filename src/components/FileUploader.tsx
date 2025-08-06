import React, { useState } from 'react';
import { Upload, Video, FileText, X } from 'lucide-react';

interface FileUploaderProps {
  onVideoUrlChange: (url: string) => void;
  onTranscriptUpload: (transcript: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onVideoUrlChange,
  onTranscriptUpload,
  isOpen,
  onClose
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleVideoUrlSubmit = () => {
    if (videoUrl.trim()) {
      onVideoUrlChange(videoUrl.trim());
      setVideoUrl('');
    }
  };

  const parseTranscriptFile = (content: string, filename: string): any[] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    try {
      switch (extension) {
        case 'json':
          return JSON.parse(content);
        
        case 'srt':
          return parseSRT(content);
        
        case 'vtt':
          return parseVTT(content);
        
        case 'ass':
        case 'ssa':
          return parseASS(content);
        
        case 'txt':
          return parsePlainText(content);
        
        default:
          throw new Error('Unsupported file format');
      }
    } catch (error) {
      console.error('Error parsing transcript:', error);
      throw error;
    }
  };

  const parseSRT = (content: string): any[] => {
    const blocks = content.trim().split(/\n\s*\n/);
    return blocks.map((block, index) => {
      const lines = block.trim().split('\n');
      const timeMatch = lines[1]?.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (!timeMatch) return null;
      
      const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
      const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
      const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');
      
      return {
        id: index + 1,
        startTime,
        endTime,
        text,
        keywords: extractKeywords(text)
      };
    }).filter(Boolean);
  };

  const parseVTT = (content: string): any[] => {
    const lines = content.split('\n');
    const cues: any[] = [];
    let currentCue: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
        if (timeMatch) {
          const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
          const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
          
          currentCue = {
            id: cues.length + 1,
            startTime,
            endTime,
            text: '',
            keywords: []
          };
        }
      } else if (currentCue && line && !line.startsWith('WEBVTT') && !line.startsWith('NOTE')) {
        currentCue.text += (currentCue.text ? ' ' : '') + line.replace(/<[^>]*>/g, '');
        if (i === lines.length - 1 || lines[i + 1].trim() === '') {
          currentCue.keywords = extractKeywords(currentCue.text);
          cues.push(currentCue);
          currentCue = null;
        }
      }
    }
    
    return cues;
  };

  const parseASS = (content: string): any[] => {
    const lines = content.split('\n');
    const dialogues: any[] = [];
    
    for (const line of lines) {
      if (line.startsWith('Dialogue:')) {
        const parts = line.split(',');
        if (parts.length >= 10) {
          const startTime = parseASSTime(parts[1]);
          const endTime = parseASSTime(parts[2]);
          const text = parts.slice(9).join(',').replace(/\\N/g, ' ').replace(/{[^}]*}/g, '');
          
          dialogues.push({
            id: dialogues.length + 1,
            startTime,
            endTime,
            text: text.trim(),
            keywords: extractKeywords(text)
          });
        }
      }
    }
    
    return dialogues;
  };

  const parseASSTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 100;
  };

  const parsePlainText = (content: string): any[] => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const avgDuration = 5; // 5 seconds per sentence
    
    return sentences.map((sentence, index) => ({
      id: index + 1,
      startTime: index * avgDuration,
      endTime: (index + 1) * avgDuration,
      text: sentence.trim(),
      keywords: extractKeywords(sentence)
    }));
  };

  const extractKeywords = (text: string): any[] => {
    // Simple keyword extraction - you can enhance this
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = words.filter(word => word.length > 3 && !commonWords.includes(word));
    
    return keywords.slice(0, 5).map(word => ({
      word,
      start: 0,
      end: 0
    }));
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const transcript = parseTranscriptFile(content, file.name);
        onTranscriptUpload(transcript);
        onClose();
      } catch (error) {
        alert('Error parsing transcript file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Content</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video URL Input */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Video className="w-5 h-5 mr-2 text-blue-600" />
              Video URL
            </h3>
            <div className="flex space-x-3">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL (MP4, WebM, etc.)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleVideoUrlSubmit}
                disabled={!videoUrl.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Load
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Transcript File
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your transcript file here
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <input
                type="file"
                accept=".json,.srt,.vtt,.ass,.ssa,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>

            {/* Supported Formats */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Supported Formats:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>JSON:</strong> Custom format with timestamps and keywords</li>
                <li><strong>SRT:</strong> SubRip subtitle format</li>
                <li><strong>VTT:</strong> WebVTT subtitle format</li>
                <li><strong>ASS/SSA:</strong> Advanced SubStation Alpha format</li>
                <li><strong>TXT:</strong> Plain text (auto-timed)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;