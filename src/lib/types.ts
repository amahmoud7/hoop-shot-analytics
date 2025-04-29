
export interface Shot {
  id: string;
  x: number; // X coordinate on court (0-100)
  y: number; // Y coordinate on court (0-100)
  isThreePoint: boolean;
  isMade: boolean;
  timestamp: number;
}

export interface GameStats {
  totalShots: number;
  madeShots: number;
  missedShots: number;
  twoPointAttempts: number;
  twoPointMade: number;
  threePointAttempts: number;
  threePointMade: number;
  shotPercentage: number;
  twoPointPercentage: number;
  threePointPercentage: number;
  pointsScored: number;
}

export interface Game {
  id: string;
  date: string;
  duration: number; // in seconds
  shots: Shot[];
  stats: GameStats;
  location?: string;
  notes?: string;
}

export interface CalibrationPoint {
  x: number;
  y: number;
  label: string;
}

export interface CourtDimensions {
  width: number;
  height: number;
  threePointRadius: number;
  keyWidth: number;
  keyHeight: number;
}

// Re-export BallDetection type from court-vision-integration
export type { BallDetection } from '../../court-vision-integration/src/lib/detection/types';
