import { Shot } from "../detection/types";
import { ShotStats, HeatmapData, ShotChartData, GameAnalytics, HeatmapDataPoint } from "./types";

/**
 * Calculates basic shooting statistics from a list of shots.
 */
export function calculateShotStats(shots: Shot[]): ShotStats {
  const totalShots = shots.length;
  const madeShots = shots.filter(s => s.isMade).length;
  const missedShots = totalShots - madeShots;

  const twoPointAttempts = shots.filter(s => !s.isThreePoint).length;
  const twoPointMade = shots.filter(s => !s.isThreePoint && s.isMade).length;

  const threePointAttempts = shots.filter(s => s.isThreePoint).length;
  const threePointMade = shots.filter(s => s.isThreePoint && s.isMade).length;

  const pointsScored = (twoPointMade * 2) + (threePointMade * 3);

  const shotPercentage = totalShots > 0 ? (madeShots / totalShots) * 100 : 0;
  const twoPointPercentage = twoPointAttempts > 0 ? (twoPointMade / twoPointAttempts) * 100 : 0;
  const threePointPercentage = threePointAttempts > 0 ? (threePointMade / threePointAttempts) * 100 : 0;

  return {
    totalShots,
    madeShots,
    missedShots,
    shotPercentage,
    twoPointAttempts,
    twoPointMade,
    twoPointPercentage,
    threePointAttempts,
    threePointMade,
    threePointPercentage,
    pointsScored,
  };
}

/**
 * Generates heatmap data points from a list of shots.
 * Requires shots to have courtX and courtY coordinates.
 * Aggregates shots into grid cells or uses raw points based on implementation needs.
 */
export function generateHeatmapData(shots: Shot[], gridSize: number = 10): HeatmapData {
  const makes: HeatmapDataPoint[] = [];
  const misses: HeatmapDataPoint[] = [];
  const allShots: HeatmapDataPoint[] = [];

  // Simple aggregation for heatmap points (count shots in grid cells)
  // A more sophisticated approach might use kernel density estimation.
  const aggregatePoints = (shotList: Shot[]): HeatmapDataPoint[] => {
    const grid: { [key: string]: HeatmapDataPoint } = {};
    shotList.forEach(shot => {
      if (shot.courtX !== undefined && shot.courtY !== undefined) {
        // Determine grid cell
        // Adjust grid logic based on court coordinate system origin and dimensions
        const gridX = Math.floor(shot.courtX / gridSize);
        const gridY = Math.floor(shot.courtY / gridSize);
        const key = `${gridX}_${gridY}`;

        if (!grid[key]) {
          grid[key] = {
            x: gridX * gridSize + gridSize / 2, // Center of the grid cell
            y: gridY * gridSize + gridSize / 2,
            value: 0,
          };
        }
        grid[key].value += 1;
      }
    });
    return Object.values(grid);
  };

  const validShots = shots.filter(s => s.courtX !== undefined && s.courtY !== undefined);
  const madeShotsList = validShots.filter(s => s.isMade);
  const missedShotsList = validShots.filter(s => !s.isMade);

  return {
    makes: aggregatePoints(madeShotsList),
    misses: aggregatePoints(missedShotsList),
    allShots: aggregatePoints(validShots),
  };
}

/**
 * Generates data suitable for rendering a shot chart.
 * Primarily filters shots with valid court coordinates.
 */
export function generateShotChartData(shots: Shot[]): ShotChartData {
  const validShots = shots.filter(s => s.courtX !== undefined && s.courtY !== undefined);
  return {
    shots: validShots,
  };
}

/**
 * Generates comprehensive analytics for a game session.
 */
export function generateGameAnalytics(
  shots: Shot[],
  gameId: string = `game_${Date.now()}`,
  heatmapGridSize: number = 10
): GameAnalytics {
  const stats = calculateShotStats(shots);
  const shotChart = generateShotChartData(shots);
  const heatmap = generateHeatmapData(shots, heatmapGridSize);

  return {
    gameId,
    timestamp: Date.now(),
    stats,
    shotChart,
    heatmap,
  };
}

