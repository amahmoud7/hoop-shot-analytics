
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import TrackerOverlay from '@/components/TrackerOverlay';
import { useShotTracking, ShotStats } from '@/lib/courtVision';
import { useDataStorage } from '@/lib/courtVision';

const Tracking = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    shots, 
    score, 
    shotAnimation, 
    mockShotDetection, 
    calculateStats,
    resetTracking
  } = useShotTracking();
  
  const { saveGame } = useDataStorage();

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

  const toggleRecording = () => {
    if (!cameraEnabled) {
      toast({
        title: "Camera Required",
        description: "Please enable camera access first",
      });
      return;
    }
    
    if (!isRecording) {
      setIsRecording(true);
      resetTracking();
      setElapsedTime(0);
      toast({
        title: "Recording Started",
        description: "Tracking basketball shots in real-time",
      });
    } else {
      setIsRecording(false);
      
      // For demo/testing, save the session with a unique ID
      const gameId = `game_${Date.now()}`;
      saveGame(gameId, {
        id: gameId,
        date: new Date().toISOString(),
        duration: elapsedTime,
        shots,
        stats: calculateStats(shots),
      });
      
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

  const handleBallDetection = (detection: any) => {
    if (isRecording) {
      // In a real implementation, this would process the ball detection
      // For now, we'll use the mock function
      mockShotDetection();
    }
  };

  const handleCameraReady = () => {
    setCameraEnabled(true);
    toast({
      title: "Camera Ready",
      description: "Press start to begin tracking",
    });
  };
  
  const requestCameraAccess = () => {
    // This function is passed to the TrackingControls
    // The actual camera request happens in CameraFeed component
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
          <CameraFeed 
            onCameraReady={handleCameraReady} 
            onDetection={handleBallDetection}
            autoStart={false}
          />
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
          cameraEnabled={cameraEnabled}
          onRequestCamera={requestCameraAccess}
        />
      </div>
    </div>
  );
};

export default Tracking;
