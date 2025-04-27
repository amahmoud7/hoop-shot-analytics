import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import TrackerOverlay from '@/components/TrackerOverlay';
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
        
        <TrackerOverlay
          isRecording={isRecording}
          elapsedTime={elapsedTime}
          shots={shots}
          score={score}
        />
        
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
