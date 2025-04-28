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
  
  // Use court calibration for determining shot coordinates and three-point status
  const { 
    isCalibrated,
    screenToCourtCoordinates,
    isThreePointShot
  } = useCourtCalibration();
  
  // Process a new ball detection
  const processBallDetection = useCallback((detection: BallDetection | null) => {
    if (!detection) {
      // No ball detected, check if we should analyze the trajectory
      if (trajectoryPoints.length >= minTrajectoryPoints) {
        analyzeTrajectory([...trajectoryPoints]);
      }
      
      // Clear trajectory points
      setTrajectoryPoints([]);
      setIsTracking(false);
      return;
    }
    
    // Add detection to trajectory
    setTrajectoryPoints(prev => [...prev, detection]);
    setIsTracking(true);
  }, [trajectoryPoints, minTrajectoryPoints]);
  
  // Set rim position for shot detection
  const setRimPosition = useCallback((position: Point) => {
    rimPositionRef.current = position;
  }, []);
  
  // Analyze a trajectory to determine if it's a shot
  const analyzeTrajectory = useCallback((points: BallDetection[]) => {
    if (points.length < minTrajectoryPoints) {
      return;
    }
    
    // Check if we're in the cooldown period
    const now = Date.now();
    if (now - lastShotTimeRef.current < shotDetectionCooldown) {
      return;
    }
    
    try {
      // Extract trajectory points
      const trajectoryPoints = points.map(d => ({
        x: d.x,
        y: d.y,
        timestamp: d.timestamp
      }));
      
      // Find peak height (minimum y value, as y increases downward in screen coordinates)
      const peakPoint = [...trajectoryPoints].sort((a, b) => a.y - b.y)[0];
      const peakHeight = peakPoint.y;
      
      // Calculate vertical displacement (screen coordinates)
      const startPoint = trajectoryPoints[0];
      const endPoint = trajectoryPoints[trajectoryPoints.length - 1];
      const verticalDisplacement = endPoint.y - startPoint.y;
      
      // Calculate horizontal displacement
      const horizontalDisplacement = endPoint.x - startPoint.x;
      
      // Calculate velocities
      const timeElapsed = (endPoint.timestamp - startPoint.timestamp) / 1000; // seconds
      const verticalVelocity = verticalDisplacement / timeElapsed;
      const horizontalVelocity = horizontalDisplacement / timeElapsed;
      
      // Calculate launch angle (using first third of trajectory for better accuracy)
      const launchIndex = Math.floor(trajectoryPoints.length / 3);
      const launchPoint = trajectoryPoints[launchIndex];
      const dx = launchPoint.x - startPoint.x;
      const dy = launchPoint.y - startPoint.y;
      const launchAngle = Math.atan2(-dy, dx) * (180 / Math.PI); // Negative dy because y increases downward
      
      // Check if this looks like a shot trajectory
      // 1. Must have a peak (goes up then down)
      // 2. Launch angle should be reasonable for a shot (10-80 degrees)
      // 3. Should have enough vertical movement
      const hasPeak = peakHeight < startPoint.y && peakHeight < endPoint.y;
      const hasReasonableAngle = launchAngle >= 10 && launchAngle <= 80;
      const hasEnoughVerticalMovement = Math.abs(verticalDisplacement) > 20;
      
      const looksLikeShot = hasPeak && hasReasonableAngle && hasEnoughVerticalMovement;
      
      if (!looksLikeShot) {
        return;
      }
      
      // Determine if shot was made
      // In a real implementation, this would use more sophisticated analysis
      // such as detecting if the ball passes through the hoop
      let isMade = false;
      
      // If rim position is known, check if ball passes near rim with downward trajectory
      if (rimPositionRef.current) {
        const rim = rimPositionRef.current;
        
        // Find points near the rim
        const pointsNearRim = trajectoryPoints.filter(p => {
          const distToRim = Math.sqrt(
            Math.pow(p.x - rim.x, 2) + 
            Math.pow(p.y - rim.y, 2)
          );
          return distToRim < 50; // Adjust threshold as needed
        });
        
        if (pointsNearRim.length > 0) {
          // Check if ball has downward trajectory near rim
          const rimPassIndex = trajectoryPoints.indexOf(pointsNearRim[0]);
          if (rimPassIndex > 0 && rimPassIndex < trajectoryPoints.length - 1) {
            const pointBeforeRim = trajectoryPoints[rimPassIndex - 1];
            const pointAtRim = pointsNearRim[0];
            const pointAfterRim = trajectoryPoints[rimPassIndex + 1];
            
            // Check for downward then upward movement (bounce off rim or through net)
            const approachingVelocity = (pointAtRim.y - pointBeforeRim.y) / 
                                       (pointAtRim.timestamp - pointBeforeRim.timestamp);
            const departingVelocity = (pointAfterRim.y - pointAtRim.y) / 
                                     (pointAfterRim.timestamp - pointAtRim.timestamp);
            
            // If approaching downward and departing upward or slowing down, likely a make
            isMade = approachingVelocity > 0 && (departingVelocity < makeThreshold || 
                                                departingVelocity < approachingVelocity * 0.5);
          }
        }
      } else {
        // Fallback if rim position unknown: use trajectory analysis
        // Check if trajectory ends with downward movement then sudden stop or change
        if (trajectoryPoints.length > minTrajectoryPoints + 2) {
          const lastFewPoints = trajectoryPoints.slice(-3);
          const finalVelocityY = (lastFewPoints[2].y - lastFewPoints[0].y) / 
                               (lastFewPoints[2].timestamp - lastFewPoints[0].timestamp);
          
          // If final velocity is small, ball might have gone through net
          isMade = Math.abs(finalVelocityY) < Math.abs(verticalVelocity) * 0.3;
        } else {
          // Very simple fallback
          isMade = Math.random() > 0.4; // Simplified for demo
        }
      }
      
      // Determine if it's a 3-pointer using court calibration
      let isThreePoint = false;
      let courtCoords = null;
      
      if (useCalibration && isCalibrated) {
        // Convert screen coordinates to court coordinates
        courtCoords = screenToCourtCoordinates(startPoint.x, startPoint.y);
        if (courtCoords) {
          isThreePoint = isThreePointShot(courtCoords.x, courtCoords.y);
        }
      } else {
        // Fallback if not calibrated: use distance from center
        const shotDistance = Math.sqrt(
          Math.pow(horizontalDisplacement, 2) + 
          Math.pow(verticalDisplacement, 2)
        );
        isThreePoint = shotDistance > 200; // Simplified threshold
      }
      
      // Create shot trajectory
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
      
      // Add to trajectories
      setShotTrajectories(prev => [...prev, shotTrajectory]);
      
      // Create shot object for the app
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
      
      // Add to shots
      setShots(prev => [...prev, shot]);
      
      // Update score if made
      if (isMade) {
        const points = isThreePoint ? 3 : 2;
        setScore(prev => ({
          ...prev,
          team1: prev.team1 + points
        }));
        
        // Show shot animation
        setShotAnimation({
          x: endPoint.x,
          y: endPoint.y,
          visible: true
        });
        
        setTimeout(() => {
          setShotAnimation(prev => ({...prev, visible: false}));
        }, 1500);
      }
      
      // Call the callback if provided
      if (onShotDetected) {
        onShotDetected(shot);
      }
      
      // Update last shot time
      lastShotTimeRef.current = now;
    } catch (error) {
      console.error('Error analyzing trajectory for shot:', error);
    }
  }, [isCalibrated, minTrajectoryPoints, onShotDetected, screenToCourtCoordinates, isThreePointShot, shotDetectionCooldown, makeThreshold, useCalibration]);
  
  // Calculate game stats
  const calculateStats = useCallback((currentShots: Shot[]) => ({
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
  }), []);
  
  // Reset tracking state
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
