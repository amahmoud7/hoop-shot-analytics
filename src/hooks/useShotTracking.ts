
import { useState } from 'react';
import { Shot, GameStats } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export const useShotTracking = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [score, setScore] = useState<{ team1: number, team2: number }>({ team1: 0, team2: 0 });
  const [shotAnimation, setShotAnimation] = useState<{ x: number, y: number, visible: boolean }>({
    x: 0, y: 0, visible: false
  });

  const mockShotDetection = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;
    const isThreePoint = Math.random() > 0.7;
    const isMade = Math.random() > 0.4;
    
    const newShot: Shot = {
      id: `shot_${Date.now()}`,
      x,
      y,
      isThreePoint,
      isMade,
      timestamp: Date.now()
    };
    
    setShots(prev => [...prev, newShot]);
    
    if (isMade) {
      const points = isThreePoint ? 3 : 2;
      setScore(prev => ({
        ...prev,
        team1: prev.team1 + points
      }));
      
      setShotAnimation({
        x,
        y,
        visible: true
      });
      
      setTimeout(() => {
        setShotAnimation(prev => ({...prev, visible: false}));
      }, 1500);
      
      toast({
        title: `${points} Points!`,
        description: `Shot made from ${isThreePoint ? "three-point range" : "two-point range"}`,
      });
    }
  };

  const calculateStats = (currentShots: Shot[]): GameStats => ({
    totalShots: currentShots.length,
    madeShots: currentShots.filter(shot => shot.isMade).length,
    twoPointAttempts: currentShots.filter(shot => !shot.isThreePoint).length,
    twoPointMade: currentShots.filter(shot => !shot.isThreePoint && shot.isMade).length,
    threePointAttempts: currentShots.filter(shot => shot.isThreePoint).length,
    threePointMade: currentShots.filter(shot => shot.isThreePoint && shot.isMade).length,
    shotPercentage: currentShots.length > 0 ? 
      (currentShots.filter(shot => shot.isMade).length / currentShots.length) * 100 : 0,
    twoPointPercentage: currentShots.filter(shot => !shot.isThreePoint).length > 0 ? 
      (currentShots.filter(shot => !shot.isThreePoint && shot.isMade).length / 
       currentShots.filter(shot => !shot.isThreePoint).length) * 100 : 0,
    threePointPercentage: currentShots.filter(shot => shot.isThreePoint).length > 0 ?
      (currentShots.filter(shot => shot.isThreePoint && shot.isMade).length / 
       currentShots.filter(shot => shot.isThreePoint).length) * 100 : 0,
  });

  return {
    shots,
    score,
    shotAnimation,
    mockShotDetection,
    calculateStats
  };
};
