
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import TrackerOverlay from '@/components/TrackerOverlay';
import { useShotTracking, ShotStats, BallDetection } from '@/lib/courtVision';
import { useDataStorage } from '@/lib/courtVision';
import { Shot } from '@/lib/types';

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
    processBallDetection,
    calculateStats,
    setRimPosition,
    isTracking
  } = useShotTracking();
  
  // Get the correct methods from useDataStorage
  const { saveGameWithAnalytics } = useDataStorage();

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

  // Added function to simulate shot detection for demo purposes
  const mockShotDetection = () => {
    // Create a mock ball detection with all required properties
    const mockDetection: BallDetection = {
      x: Math.random() * 640,
      y: Math.random() * 480,
      timestamp: Date.now(),
      confidence: 0.9,
      radius: 15 // Add the missing radius property
    };
    
    // Process the mock detection
    processBallDetection(mockDetection);
  };

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
      setElapsedTime(0);
      toast({
        title: "Recording Started",
        description: "Tracking basketball shots in real-time",
      });
    } else {
      setIsRecording(false);
      
      // Calculate stats with all required properties
      const gameStats = calculateStats(shots as Shot[]);
      
      // For demo/testing, save the session with a unique ID
      const gameId = `game_${Date.now()}`;
      
      // Use the correct method from useDataStorage - passing GameAnalytics directly, not wrapped
      saveGameWithAnalytics(gameId, {
        gameId,
        timestamp: Date.now(),
        stats: gameStats,
        shotChart: { shots: shots as Shot[] },
        heatmap: { makes: [], misses: [], allShots: [] }
      });
      
      navigate('/game-summary', { 
        state: { 
          shots,
          stats: gameStats,
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
          shots={shots as Shot[]}
          score={score}
        />
        
        <TrackingControls 
          isRecording={isRecording}
          stats={calculateStats(shots as Shot[])}
          onToggleRecording={toggleRecording}
          cameraEnabled={cameraEnabled}
          onRequestCamera={requestCameraAccess}
        />
      </div>
    </div>
  );
};

export default Tracking;
