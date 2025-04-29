
import { BallDetection, Point, Shot, ShotTrajectory } from './types';

/**
 * Analyzes trajectory points to determine if they represent a valid shot
 */
export const analyzeTrajectoryPoints = (
  points: BallDetection[],
  minTrajectoryPoints: number,
  makeThreshold: number,
  rimPosition: Point | null,
  isCalibrated: boolean,
  screenToCourtCoordinates: (x: number, y: number) => Point | null,
  isThreePointShot: (x: number, y: number) => boolean,
  useCalibration: boolean
): { isValidShot: boolean; trajectory?: ShotTrajectory; shot?: Shot } => {
  if (points.length < minTrajectoryPoints) {
    return { isValidShot: false };
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
      return { isValidShot: false };
    }
    
    let isMade = false;
    
    if (rimPosition) {
      const rim = rimPosition;
      
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
    
    return {
      isValidShot: true,
      trajectory: shotTrajectory,
      shot
    };
  } catch (error) {
    console.error('Error analyzing trajectory for shot:', error);
    return { isValidShot: false };
  }
};
