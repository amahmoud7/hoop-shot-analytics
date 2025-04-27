
import React from 'react';
import { Shot } from '@/lib/types';

interface TrackerOverlayProps {
  isRecording: boolean;
  elapsedTime: number;
  shots: Shot[];
  score: { team1: number; team2: number };
}

const TrackerOverlay: React.FC<TrackerOverlayProps> = ({
  isRecording,
  elapsedTime,
  shots,
  score,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="flex justify-between items-center p-4 pt-16">
        <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
          {isRecording && (
            <>
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              <span>{formatTime(elapsedTime)}</span>
            </>
          )}
        </div>
        <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
          {shots.length} Shots
        </div>
      </div>
      
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg text-white text-center">
          <p className="text-xs text-gray-400">SCORE</p>
          <p className="text-2xl font-bold">{score.team1}</p>
        </div>
      </div>
      
      <div className="absolute bottom-32 right-4">
        <div className="bg-black bg-opacity-50 p-2 rounded-lg">
          {[...shots].reverse().slice(0, 5).map((shot, index) => (
            <div key={shot.id} className="flex items-center mb-1 last:mb-0">
              <div className={`w-2 h-2 rounded-full mr-1 ${shot.isMade ? 'bg-teal' : 'bg-red-500'}`}></div>
              <span className="text-xs text-white">
                {shot.isMade ? '+' : ''}
                {shot.isThreePoint ? '3PT' : '2PT'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackerOverlay;
