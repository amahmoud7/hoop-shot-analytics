import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import TrackerOverlay from '@/components/TrackerOverlay';
import { useShotTracking } from '@/hooks/useShotTracking';
import { useDataStorage } from '@/lib/courtVision';
import { Shot } from '@/lib/types';
import { BallDetection } from '../../court-vision-integration/src/lib/detection/types';

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
    calculateStats
  } = useShotTracking();
  
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
      
      const gameStats = calculateStats(shots as Shot[]);
      
      const gameId = `game_${Date.now()}`;
      
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

  const handleBallDetection = (detection: BallDetection) => {
    if (isRecording) {
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
          onRequestCamera={() => {}}
        />
      </div>
    </div>
  );
};

export default Tracking;
