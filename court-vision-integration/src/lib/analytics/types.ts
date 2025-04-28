import { Shot } from "../detection/types";

// Basic statistics structure
export interface ShotStats {
  totalShots: number;
  madeShots: number;
  missedShots: number;
  shotPercentage: number; // 0-100

  twoPointAttempts: number;
  twoPointMade: number;
  twoPointPercentage: number; // 0-100

  threePointAttempts: number;
  threePointMade: number;
  threePointPercentage: number; // 0-100

  pointsScored: number;
}

// Structure for heatmap data
export interface HeatmapDataPoint {
  x: number; // Court X coordinate
  y: number; // Court Y coordinate
  value: number; // Intensity (e.g., number of shots or makes)
}

export interface HeatmapData {
  makes: HeatmapDataPoint[];
  misses: HeatmapDataPoint[];
  allShots: HeatmapDataPoint[];
}

// Structure for shot chart data
export interface ShotChartData {
  shots: Shot[]; // Includes court coordinates if available
}

// Overall analytics structure
export interface GameAnalytics {
  gameId: string;
  timestamp: number;
  stats: ShotStats;
  shotChart: ShotChartData;
  heatmap: HeatmapData;
  // Add more analytics as needed (e.g., shot streaks, time-based analysis)
}

