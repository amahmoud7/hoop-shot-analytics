import { useState, useCallback, useEffect, useRef } from 'react';
import { BallDetection, Shot, ShotTrajectory, Point } from './types';
import { useCourtCalibration } from './useCourtCalibration';

interface UseShotTrackingProps {
  onShotDetected?: (shot: Shot) => void;
  minTrajectoryPoints?: number;
  shotDetectionCooldown?: number; // milliseconds
  makeThreshold?: number; // Vertical velocity threshold for make detection
  useCalibration?: boolean; // Whether to use court calibration for 3pt detection
}

export const useShotTracking = ({
  onShotDetected,
  minTrajectoryPoints = 5,
  shotDetectionCooldown = 2000, // 2 seconds
  makeThreshold = -0.5, // Negative value indicates upward movement
  useCalibration = true,
}: UseShotTrackingProps = {}) => {
  const [trajectoryPoints, setTrajectoryPoints] = useState<BallDetection[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [shotTrajectories, setShotTrajectories] = useState<ShotTrajectory[]>([]);
  const [score, setScore] = useState<{ team1: number, team2: number }>({ team1: 0, team2: 0 });
  const [shotAnimation, setShotAnimation] = useState<{ x: number, y: number, visible: boolean }>({
    x: 0, y: 0, visible: false
  });
  
  const lastShotTimeRef = useRef<number>(0);
  const rimPositionRef = useRef<Point | null>(null);
  
  const { 
    isCalibrated,
    screenToCourtCoordinates,
    isThreePointShot
  } = useCourtCalibration();
  
  const processBallDetection = useCallback((detection: BallDetection | null) => {
    if (!detection) {
      if (trajectoryPoints.length >= minTrajectoryPoints) {
        analyzeTrajectory([...trajectoryPoints]);
      }
      
      setTrajectoryPoints([]);
      setIsTracking(false);
      return;
    }
    
    setTrajectoryPoints(prev => [...prev, detection]);
    setIsTracking(true);
  }, [trajectoryPoints, minTrajectoryPoints]);
  
  const setRimPosition = useCallback((position: Point) => {
    rimPositionRef.current = position;
  }, []);
  
  const analyzeTrajectory = useCallback((points: BallDetection[]) => {
    if (points.length < minTrajectoryPoints) {
      return;
    }
    
    const now = Date.now();
    if (now - lastShotTimeRef.current < shotDetectionCooldown) {
      return;
    }
    
    try {
      const trajectoryPoints = points.map(d => ({
        x: d.x,
        y: d.y,
        timestamp: d.timestamp
      }));
      
      const peakPoint = [...trajectoryPoints].sort((a, b) => a.y - b.y)[0];
      const peakHeight = peakPoint.y;
      
      const startPoint = trajectoryPoints[0];
      const endPoint = trajectoryPoints[trajectoryPoints.length - 1];
      const verticalDisplacement = endPoint.y - startPoint.y;
      
      const horizontalDisplacement = endPoint.x - startPoint.x;
      
      const timeElapsed = (endPoint.timestamp - startPoint.timestamp) / 1000;
      const verticalVelocity = verticalDisplacement / timeElapsed;
      const horizontalVelocity = horizontalDisplacement / timeElapsed;
      
      const launchIndex = Math.floor(trajectoryPoints.length / 3);
      const launchPoint = trajectoryPoints[launchIndex];
      const dx = launchPoint.x - startPoint.x;
      const dy = launchPoint.y - startPoint.y;
      const launchAngle = Math.atan2(-dy, dx) * (180 / Math.PI);
      
      const hasPeak = peakHeight < startPoint.y && peakHeight < endPoint.y;
      const hasReasonableAngle = launchAngle >= 10 && launchAngle <= 80;
      const hasEnoughVerticalMovement = Math.abs(verticalDisplacement) > 20;
      
      const looksLikeShot = hasPeak && hasReasonableAngle && hasEnoughVerticalMovement;
      
      if (!looksLikeShot) {
        return;
      }
      
      let isMade = false;
      
      if (rimPositionRef.current) {
        const rim = rimPositionRef.current;
        
        const pointsNearRim = trajectoryPoints.filter(p => {
          const distToRim = Math.sqrt(
            Math.pow(p.x - rim.x, 2) + 
            Math.pow(p.y - rim.y, 2)
          );
          return distToRim < 50;
        });
        
        if (pointsNearRim.length > 0) {
          const rimPassIndex = trajectoryPoints.indexOf(pointsNearRim[0]);
          if (rimPassIndex > 0 && rimPassIndex < trajectoryPoints.length - 1) {
            const pointBeforeRim = trajectoryPoints[rimPassIndex - 1];
            const pointAtRim = pointsNearRim[0];
            const pointAfterRim = trajectoryPoints[rimPassIndex + 1];
            
            const approachingVelocity = (pointAtRim.y - pointBeforeRim.y) / 
                                       (pointAtRim.timestamp - pointBeforeRim.timestamp);
            const departingVelocity = (pointAfterRim.y - pointAtRim.y) / 
                                     (pointAfterRim.timestamp - pointAtRim.timestamp);
            
            isMade = approachingVelocity > 0 && (departingVelocity < makeThreshold || 
                                                departingVelocity < approachingVelocity * 0.5);
          }
        }
      } else {
        if (trajectoryPoints.length > minTrajectoryPoints + 2) {
          const lastFewPoints = trajectoryPoints.slice(-3);
          const finalVelocityY = (lastFewPoints[2].y - lastFewPoints[0].y) / 
                               (lastFewPoints[2].timestamp - lastFewPoints[0].timestamp);
          
          isMade = Math.abs(finalVelocityY) < Math.abs(verticalVelocity) * 0.3;
        } else {
          isMade = Math.random() > 0.4;
        }
      }
      
      let isThreePoint = false;
      let courtCoords = null;
      
      if (useCalibration && isCalibrated) {
        courtCoords = screenToCourtCoordinates(startPoint.x, startPoint.y);
        if (courtCoords) {
          isThreePoint = isThreePointShot(courtCoords.x, courtCoords.y);
        }
      } else {
        const shotDistance = Math.sqrt(
          Math.pow(horizontalDisplacement, 2) + 
          Math.pow(verticalDisplacement, 2)
        );
        isThreePoint = shotDistance > 200;
      }
      
      const shotTrajectory: ShotTrajectory = {
        points: trajectoryPoints,
        startTime: points[0].timestamp,
        endTime: points[points.length - 1].timestamp,
        peakHeight,
        launchAngle,
        isMade,
        isThreePoint,
        courtStartX: courtCoords?.x,
        courtStartY: courtCoords?.y
      };
      
      setShotTrajectories(prev => [...prev, shotTrajectory]);
      
      const shot: Shot = {
        id: `shot_${Date.now()}`,
        x: startPoint.x,
        y: startPoint.y,
        courtX: courtCoords?.x,
        courtY: courtCoords?.y,
        isThreePoint,
        isMade,
        timestamp: Date.now(),
        trajectory: shotTrajectory
      };
      
      setShots(prev => [...prev, shot]);
      
      if (isMade) {
        const points = isThreePoint ? 3 : 2;
        setScore(prev => ({
          ...prev,
          team1: prev.team1 + points
        }));
        
        setShotAnimation({
          x: endPoint.x,
          y: endPoint.y,
          visible: true
        });
        
        setTimeout(() => {
          setShotAnimation(prev => ({...prev, visible: false}));
        }, 1500);
      }
      
      if (onShotDetected) {
        onShotDetected(shot);
      }
      
      lastShotTimeRef.current = now;
    } catch (error) {
      console.error('Error analyzing trajectory for shot:', error);
    }
  }, [isCalibrated, minTrajectoryPoints, onShotDetected, screenToCourtCoordinates, isThreePointShot, shotDetectionCooldown, makeThreshold, useCalibration]);
  
  const calculateStats = useCallback((currentShots: Shot[]) => {
    const madeShots = currentShots.filter(shot => shot.isMade).length;
    const twoPointMade = currentShots.filter(shot => !shot.isThreePoint && shot.isMade).length;
    const threePointMade = currentShots.filter(shot => shot.isThreePoint && shot.isMade).length;
    
    const missedShots = currentShots.length - madeShots;
    
    const pointsScored = (twoPointMade * 2) + (threePointMade * 3);
    
    return {
      totalShots: currentShots.length,
      madeShots: madeShots,
      missedShots: missedShots,
      twoPointAttempts: currentShots.filter(shot => !shot.isThreePoint).length,
      twoPointMade: twoPointMade,
      threePointAttempts: currentShots.filter(shot => shot.isThreePoint).length,
      threePointMade: threePointMade,
      shotPercentage: currentShots.length > 0 ? 
        (madeShots / currentShots.length) * 100 : 0,
      twoPointPercentage: currentShots.filter(shot => !shot.isThreePoint).length > 0 ? 
        (twoPointMade / currentShots.filter(shot => !shot.isThreePoint).length) * 100 : 0,
      threePointPercentage: currentShots.filter(shot => shot.isThreePoint).length > 0 ?
        (threePointMade / currentShots.filter(shot => shot.isThreePoint).length) * 100 : 0,
      pointsScored: pointsScored
    };
  }, []);
  
  const resetTracking = useCallback(() => {
    setTrajectoryPoints([]);
    setIsTracking(false);
    setShots([]);
    setShotTrajectories([]);
    setScore({ team1: 0, team2: 0 });
    setShotAnimation({ x: 0, y: 0, visible: false });
    lastShotTimeRef.current = 0;
  }, []);
  
  return {
    isTracking,
    trajectoryPoints,
    shots,
    shotTrajectories,
    score,
    shotAnimation,
    processBallDetection,
    setRimPosition,
    calculateStats,
    resetTracking
  };
};
