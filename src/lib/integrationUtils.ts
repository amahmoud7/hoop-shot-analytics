
/**
 * Utility functions for integrating CourtVision with Hoop Shot Analytics
 */

import { Shot as CVShot } from '../court-vision-integration/src/lib/detection/types';
import { Shot as AppShot } from './types';

/**
 * Convert CourtVision shots to app shot format
 */
export const convertShotsToAppFormat = (shots: CVShot[]): AppShot[] => {
  return shots.map(shot => ({
    id: shot.id,
    x: shot.x,
    y: shot.y,
    isThreePoint: shot.isThreePoint,
    isMade: shot.isMade,
    timestamp: shot.timestamp
  }));
};

/**
 * Convert app shots to CourtVision shot format
 */
export const convertShotsToCourtVisionFormat = (shots: AppShot[]): CVShot[] => {
  return shots.map(shot => ({
    id: shot.id,
    x: shot.x,
    y: shot.y,
    isThreePoint: shot.isThreePoint,
    isMade: shot.isMade,
    timestamp: shot.timestamp,
    courtX: undefined,
    courtY: undefined
  }));
};

/**
 * Initialize CourtVision integration
 */
const initializeIntegration = () => {
  console.log('Initializing CourtVision integration...');
  
  // Add initialization logic if needed
  
  return true;
};

const integrationUtils = {
  convertShotsToAppFormat,
  convertShotsToCourtVisionFormat,
  initializeIntegration
};

export default integrationUtils;
