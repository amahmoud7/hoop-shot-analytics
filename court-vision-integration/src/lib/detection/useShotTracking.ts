
import { useState, useCallback, useEffect, useRef } from 'react';
import { BallDetection, Shot, ShotTrajectory, Point } from './types';
import { useCourtCalibration } from './useCourtCalibration';
import { analyzeTrajectoryPoints } from './trajectoryAnalyzer';
import { calculateStats } from './statsCalculator';

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
    
    const result = analyzeTrajectoryPoints(
      points,
      minTrajectoryPoints,
      makeThreshold,
      rimPositionRef.current,
      isCalibrated,
      screenToCourtCoordinates,
      isThreePointShot,
      useCalibration
    );
    
    if (!result.isValidShot || !result.shot || !result.trajectory) {
      return;
    }
    
    const { shot, trajectory } = result;
    
    setShotTrajectories(prev => [...prev, trajectory]);
    setShots(prev => [...prev, shot]);
    
    if (shot.isMade) {
      const points = shot.isThreePoint ? 3 : 2;
      setScore(prev => ({
        ...prev,
        team1: prev.team1 + points
      }));
      
      setShotAnimation({
        x: trajectory.points[trajectory.points.length - 1].x,
        y: trajectory.points[trajectory.points.length - 1].y,
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
  }, [isCalibrated, minTrajectoryPoints, onShotDetected, screenToCourtCoordinates, isThreePointShot, shotDetectionCooldown, makeThreshold, useCalibration]);
  
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
