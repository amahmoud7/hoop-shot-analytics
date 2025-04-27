
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Camera, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { toast } from '@/components/ui/use-toast';
import { Shot, GameStats } from '@/lib/types';
import StatsCard from '@/components/StatsCard';

const Tracking = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [score, setScore] = useState<{ team1: number, team2: number }>({ team1: 0, team2: 0 });
  const [shotAnimation, setShotAnimation] = useState<{ x: number, y: number, visible: boolean }>({
    x: 0, y: 0, visible: false
  });
  
  // Calculate stats based on shots
  const stats: GameStats = {
    totalShots: shots.length,
    madeShots: shots.filter(shot => shot.isMade).length,
    twoPointAttempts: shots.filter(shot => !shot.isThreePoint).length,
    twoPointMade: shots.filter(shot => !shot.isThreePoint && shot.isMade).length,
    threePointAttempts: shots.filter(shot => shot.isThreePoint).length,
    threePointMade: shots.filter(shot => shot.isThreePoint && shot.isMade).length,
    shotPercentage: shots.length > 0 ? (shots.filter(shot => shot.isMade).length / shots.length) * 100 : 0,
    twoPointPercentage: shots.filter(shot => !shot.isThreePoint).length > 0 ? 
      (shots.filter(shot => !shot.isThreePoint && shot.isMade).length / shots.filter(shot => !shot.isThreePoint).length) * 100 : 0,
    threePointPercentage: shots.filter(shot => shot.isThreePoint).length > 0 ?
      (shots.filter(shot => shot.isThreePoint && shot.isMade).length / shots.filter(shot => shot.isThreePoint).length) * 100 : 0,
  };
  
  // Timer for recording duration
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

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Mock shot detection for demo
  const mockShotDetection = () => {
    // Random position on court
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;
    
    // Random shot type and result
    const isThreePoint = Math.random() > 0.7;
    const isMade = Math.random() > 0.4;
    
    // Create shot
    const newShot: Shot = {
      id: `shot_${Date.now()}`,
      x,
      y,
      isThreePoint,
      isMade,
      timestamp: Date.now()
    };
    
    // Update shots
    setShots(prev => [...prev, newShot]);
    
    // Update score
    if (isMade) {
      const points = isThreePoint ? 3 : 2;
      setScore(prev => ({
        ...prev,
        team1: prev.team1 + points
      }));
      
      // Show animation
      setShotAnimation({
        x,
        y,
        visible: true
      });
      
      setTimeout(() => {
        setShotAnimation(prev => ({...prev, visible: false}));
      }, 1500);
      
      // Show toast
      toast({
        title: `${points} Points!`,
        description: `Shot made from ${isThreePoint ? "three-point range" : "two-point range"}`,
      });
    }
  };
  
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Tracking basketball shots in real-time",
      });
      
      // Mock first shot detection after a delay
      setTimeout(() => {
        mockShotDetection();
      }, 3000);
      
      // Set interval for random shots
      const shotInterval = setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance to detect a shot
          mockShotDetection();
        }
      }, 8000);
      
      // Store interval ID to clear it later
      window.localStorage.setItem('shotIntervalId', shotInterval.toString());
      
    } else {
      // Stop recording
      setIsRecording(false);
      
      // Clear shot interval
      const intervalId = window.localStorage.getItem('shotIntervalId');
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        window.localStorage.removeItem('shotIntervalId');
      }
      
      // Save game data and navigate to summary
      navigate('/game-summary', { 
        state: { 
          shots,
          stats,
          duration: elapsedTime,
          score
        }
      });
    }
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
        {/* Camera feed placeholder */}
        <div className="absolute inset-0 bg-black">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-4 opacity-50" />
              <p className="opacity-75">Camera feed unavailable in prototype</p>
            </div>
          </div>
        </div>
        
        {/* Shot animation */}
        {shotAnimation.visible && (
          <div 
            className="absolute w-5 h-5 bg-basketball rounded-full animate-pulse"
            style={{ left: `${shotAnimation.x}%`, top: `${shotAnimation.y}%` }}
          >
            <div className="h-32 w-px border-r border-dashed border-white absolute bottom-full left-1/2 transform -translate-x-1/2 animate-shot-arc"></div>
          </div>
        )}
        
        {/* Overlay UI elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top info bar */}
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
          
          {/* Score display */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg text-white text-center">
              <p className="text-xs text-gray-400">SCORE</p>
              <p className="text-2xl font-bold">{score.team1}</p>
            </div>
          </div>
          
          {/* Recent shots */}
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
        
        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
          {/* Stats card (when recording) */}
          {isRecording && shots.length > 0 && (
            <div className="mb-4">
              <StatsCard stats={stats} compact={true} className="bg-opacity-90" />
            </div>
          )}
          
          {/* Control buttons */}
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              className="bg-white text-navy hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
            >
              <Plus size={24} />
            </Button>
            
            <Button
              className={`w-20 h-20 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-basketball hover:bg-orange-600'} text-white flex items-center justify-center`}
              onClick={toggleRecording}
            >
              {isRecording ? <Check size={32} /> : <Camera size={32} />}
            </Button>
            
            <Button 
              variant="ghost" 
              className="bg-white text-navy hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
            >
              <Minus size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
