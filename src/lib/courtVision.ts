
/**
 * CourtVision Integration Module
 * 
 * This file integrates the CourtVision AI functionality with the existing Hoop Shot Analytics app
 */

// Re-export core detection functionality
export type { 
  BallDetection,
  Shot,
  ShotTrajectory,
  TrajectoryPoint 
} from '../../court-vision-integration/src/lib/detection/types';

// Define ShotStats type based on GameStats from our app
export interface ShotStats {
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

// Re-export analytics functionality
export {
  useAnalytics,
  calculateShotStats,
  generateHeatmapData,
  generateShotChartData
} from '../../court-vision-integration/src/lib/analytics';

// Re-export storage functionality
export {
  useDataStorage,
  saveShots,
  loadShots,
  saveGame,
  loadGame,
  getGamesList,
  deleteGame
} from '../../court-vision-integration/src/lib/storage';

// Re-export ball detection, court calibration and shot tracking
export {
  useBallDetection,
  useCourtCalibration,
  useShotTracking
} from '../../court-vision-integration/src/lib/detection';

// Export integration utilities
export { default as integrationUtils } from './integrationUtils';
