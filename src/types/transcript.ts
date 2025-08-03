export interface TranscriptItem {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  keywords: string[];
}