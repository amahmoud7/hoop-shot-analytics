
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ShotAnimationOverlay from '@/components/ShotAnimationOverlay';
import TrackingControls from '@/components/TrackingControls';
import TrackerOverlay from '@/components/TrackerOverlay';
import { useShotTracking } from '@/lib/courtVision';
import { useDataStorage } from '@/lib/courtVision';

const Tracking = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const { 
    shots, 
    score, 
    shotAnimation, 
    processBallDetection, 
    calculateStats,
    resetTracking
  } = useShotTracking({
    onShotDetected: (shot) => {
      toast({
        title: shot.isMade ? `${shot.isThreePoint ? "3" : "2"} Points!` : "Shot missed",
        description: `${shot.isMade ? "Made" : "Missed"} from ${shot.isThreePoint ? "three-point range" : "two-point range"}`,
      });
    }
  });
  
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
      saveGameWithAnalytics(gameId, {
        gameId,
        timestamp: Date.now(),
        stats: calculateStats(shots),
        shotChart: { shots },
        heatmap: { makes: [], misses: [], allShots: [] }
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
      processBallDetection(detection);
    }
  };

  const handleCameraReady = () => {
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
        />
      </div>
    </div>
  );
};

export default Tracking;
