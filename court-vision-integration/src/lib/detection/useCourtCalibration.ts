import { useState, useEffect, useCallback, useRef } from 'react';
import { CourtCalibrator } from './courtCalibrator';
import { CalibrationPoint, CourtCalibration, CourtDimensions, Point } from './types';

interface UseCourtCalibrationProps {
  initialCalibration?: CourtCalibration;
  courtDimensions?: Partial<CourtDimensions>;
  onCalibrationChange?: (calibration: CourtCalibration | null) => void;
  persistCalibration?: boolean; // Whether to save/load calibration from localStorage
  storageKey?: string; // Key for localStorage if persistCalibration is true
}

export const useCourtCalibration = ({
  initialCalibration,
  courtDimensions,
  onCalibrationChange,
  persistCalibration = true,
  storageKey = 'court-calibration',
}: UseCourtCalibrationProps = {}) => {
  const [calibrator] = useState<CourtCalibrator>(() => new CourtCalibrator(courtDimensions));
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [calibrationError, setCalibrationError] = useState<string | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Initialize calibration from props or localStorage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Try to load from initialCalibration prop first
    if (initialCalibration) {
      const success = calibrator.loadCalibration(initialCalibration);
      if (success) {
        setCalibrationPoints(calibrator.getCalibrationPoints());
        setIsCalibrated(true);
        setCalibrationError(null);
        return;
      }
    }

    // Then try localStorage if enabled
    if (persistCalibration) {
      try {
        const savedCalibration = localStorage.getItem(storageKey);
        if (savedCalibration) {
          const calibrationData = JSON.parse(savedCalibration) as CourtCalibration;
          const success = calibrator.loadCalibration(calibrationData);
          if (success) {
            setCalibrationPoints(calibrator.getCalibrationPoints());
            setIsCalibrated(true);
            setCalibrationError(null);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load calibration from localStorage:', error);
        // Continue with empty calibration
      }
    }
  }, [calibrator, initialCalibration, persistCalibration, storageKey]);

  // Save calibration to localStorage when it changes
  useEffect(() => {
    if (!persistCalibration || !isCalibrated) return;

    const calibration = calibrator.getCalibration();
    if (calibration) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(calibration));
      } catch (error) {
        console.warn('Failed to save calibration to localStorage:', error);
      }
    }
  }, [calibrator, isCalibrated, persistCalibration, storageKey]);

  // Notify parent component of calibration changes
  useEffect(() => {
    if (!onCalibrationChange) return;
    
    const calibration = isCalibrated ? calibrator.getCalibration() : null;
    onCalibrationChange(calibration);
  }, [calibrator, isCalibrated, onCalibrationChange]);

  // Add a calibration point
  const addCalibrationPoint = useCallback((point: CalibrationPoint) => {
    calibrator.addCalibrationPoint(point);
    setCalibrationPoints(calibrator.getCalibrationPoints());
    setIsCalibrated(false); // Reset calibration status
    setCalibrationError(null);
  }, [calibrator]);

  // Set all calibration points at once
  const setAllCalibrationPoints = useCallback((points: CalibrationPoint[]) => {
    calibrator.setCalibrationPoints(points);
    setCalibrationPoints(calibrator.getCalibrationPoints());
    setIsCalibrated(false); // Reset calibration status
    setCalibrationError(null);
  }, [calibrator]);

  // Clear all calibration points
  const clearCalibrationPoints = useCallback(() => {
    calibrator.clearCalibrationPoints();
    setCalibrationPoints([]);
    setIsCalibrated(false);
    setCalibrationError(null);
  }, [calibrator]);

  // Compute homography and update calibration status
  const computeCalibration = useCallback(() => {
    setCalibrationError(null);
    
    if (!calibrator.hasEnoughPoints()) {
      setCalibrationError('Need at least 4 calibration points');
      return false;
    }

    const success = calibrator.computeHomography();
    setIsCalibrated(success);
    
    if (!success) {
      setCalibrationError('Failed to compute calibration. Points may be degenerate.');
    }
    
    return success;
  }, [calibrator]);

  // Transform screen coordinates to court coordinates
  const screenToCourtCoordinates = useCallback((x: number, y: number): Point | null => {
    if (!isCalibrated && !computeCalibration()) {
      return null;
    }
    return calibrator.screenToCourtCoordinates(x, y);
  }, [calibrator, isCalibrated, computeCalibration]);

  // Transform court coordinates to screen coordinates
  const courtToScreenCoordinates = useCallback((courtX: number, courtY: number): Point | null => {
    if (!isCalibrated && !computeCalibration()) {
      return null;
    }
    return calibrator.courtToScreenCoordinates(courtX, courtY);
  }, [calibrator, isCalibrated, computeCalibration]);

  // Check if a shot is beyond the three-point line
  const isThreePointShot = useCallback((courtX: number, courtY: number): boolean => {
    return calibrator.isThreePointShot(courtX, courtY);
  }, [calibrator]);

  // Load a saved calibration
  const loadCalibration = useCallback((calibration: CourtCalibration): boolean => {
    const success = calibrator.loadCalibration(calibration);
    if (success) {
      setCalibrationPoints(calibrator.getCalibrationPoints());
      setIsCalibrated(true);
      setCalibrationError(null);
    } else {
      setCalibrationError('Failed to load calibration data');
    }
    return success;
  }, [calibrator]);

  // Get the current calibration
  const getCalibration = useCallback((): CourtCalibration | null => {
    if (!isCalibrated) return null;
    return calibrator.getCalibration();
  }, [calibrator, isCalibrated]);

  return {
    calibrationPoints,
    isCalibrated,
    calibrationError,
    addCalibrationPoint,
    setAllCalibrationPoints,
    clearCalibrationPoints,
    computeCalibration,
    screenToCourtCoordinates,
    courtToScreenCoordinates,
    isThreePointShot,
    loadCalibration,
    getCalibration,
  };
};
