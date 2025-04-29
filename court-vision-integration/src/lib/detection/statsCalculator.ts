
import { Shot } from './types';

/**
 * Calculate shooting statistics from shot data
 */
export const calculateStats = (shots: Shot[]) => {
  const madeShots = shots.filter(shot => shot.isMade).length;
  const twoPointMade = shots.filter(shot => !shot.isThreePoint && shot.isMade).length;
  const threePointMade = shots.filter(shot => shot.isThreePoint && shot.isMade).length;
  
  const missedShots = shots.length - madeShots;
  
  const pointsScored = (twoPointMade * 2) + (threePointMade * 3);
  
  return {
    totalShots: shots.length,
    madeShots: madeShots,
    missedShots: missedShots,
    twoPointAttempts: shots.filter(shot => !shot.isThreePoint).length,
    twoPointMade: twoPointMade,
    threePointAttempts: shots.filter(shot => shot.isThreePoint).length,
    threePointMade: threePointMade,
    shotPercentage: shots.length > 0 ? 
      (madeShots / shots.length) * 100 : 0,
    twoPointPercentage: shots.filter(shot => !shot.isThreePoint).length > 0 ? 
      (twoPointMade / shots.filter(shot => !shot.isThreePoint).length) * 100 : 0,
    threePointPercentage: shots.filter(shot => shot.isThreePoint).length > 0 ?
      (threePointMade / shots.filter(shot => shot.isThreePoint).length) * 100 : 0,
    pointsScored: pointsScored
  };
};
