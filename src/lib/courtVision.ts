
/**
 * CourtVision Integration Module
 * 
 * This file integrates the CourtVision AI functionality with the existing Hoop Shot Analytics app
 */

// Re-export core detection functionality
export {
  BallDetection,
  Shot,
  ShotTrajectory,
  TrajectoryPoint,
  ShotStats
} from '../court-vision-integration/src/lib/detection/types';

// Re-export analytics functionality
export {
  useAnalytics,
  calculateShotStats,
  generateHeatmapData,
  generateShotChartData
} from '../court-vision-integration/src/lib/analytics';

// Re-export storage functionality
export {
  useDataStorage,
  saveShots,
  loadShots,
  saveGame,
  loadGame,
  getGamesList,
  deleteGame
} from '../court-vision-integration/src/lib/storage';

// Re-export ball detection, court calibration and shot tracking
export {
  useBallDetection,
  useCourtCalibration,
  useShotTracking
} from '../court-vision-integration/src/lib/detection';

// Export integration utilities
export { default as integrationUtils } from './integrationUtils';
