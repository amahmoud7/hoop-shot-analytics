
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { toast } from '@/components/ui/use-toast';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import { useShotTracking } from '@/hooks/useShotTracking';

const Tracking = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const { shots, score, shotAnimation, mockShotDetection, calculateStats } = useShotTracking();

  useEffect(() => {
    let interval: number;

    if (isRecording) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Tracking basketball shots in real-time",
      });
      
      setTimeout(() => {
        mockShotDetection();
      }, 3000);
      
      const shotInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          mockShotDetection();
        }
      }, 8000);
      
      window.localStorage.setItem('shotIntervalId', shotInterval.toString());
      
    } else {
      setIsRecording(false);
      
      const intervalId = window.localStorage.getItem('shotIntervalId');
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        window.localStorage.removeItem('shotIntervalId');
      }
      
      navigate('/game-summary', { 
        state: { 
          shots,
          stats: calculateStats(shots),
          duration: elapsedTime,
          score
        }
      });
    }
  };

  const handleCameraReady = () => {
    setIsRecording(true);
    toast({
      title: "Tracking Started",
      description: "Shot tracking is now active",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-800">
      <Header 
        title="Shot Tracking" 
        showBack={!isRecording} 
        showMenu={false} 
        className="bg-black bg-opacity-50 z-10"
      />
      
      <div className="flex-1 relative flex flex-col">
        <div className="absolute inset-0">
          <CameraFeed onCameraReady={handleCameraReady} />
        </div>
        
        <ShotAnimationOverlay {...shotAnimation} />
        
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
        
        <TrackingControls 
          isRecording={isRecording}
          stats={calculateStats(shots)}
          onToggleRecording={toggleRecording}
        />
      </div>
    </div>
  );
};

export default Tracking;
