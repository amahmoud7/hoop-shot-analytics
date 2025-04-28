import { useState, useCallback, useEffect } from 'react';
import { Shot } from '../detection/types';
import { GameAnalytics, ShotStats, HeatmapData, ShotChartData } from './types';
import { calculateShotStats, generateHeatmapData, generateShotChartData, generateGameAnalytics } from './analyticsGenerator';

interface UseAnalyticsProps {
  shots?: Shot[];
  autoUpdate?: boolean;
  gameId?: string;
  heatmapGridSize?: number;
  onAnalyticsGenerated?: (analytics: GameAnalytics) => void;
}

export const useAnalytics = ({
  shots = [],
  autoUpdate = true,
  gameId = `game_${Date.now()}`,
  heatmapGridSize = 10,
  onAnalyticsGenerated,
}: UseAnalyticsProps = {}) => {
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [stats, setStats] = useState<ShotStats | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [shotChart, setShotChart] = useState<ShotChartData | null>(null);

  // Generate analytics when shots change (if autoUpdate is true)
  useEffect(() => {
    if (autoUpdate && shots.length > 0) {
      generateAnalytics();
    }
  }, [shots, autoUpdate]);

  // Generate all analytics
  const generateAnalytics = useCallback(() => {
    if (shots.length === 0) {
      return null;
    }

    const newAnalytics = generateGameAnalytics(shots, gameId, heatmapGridSize);
    
    setAnalytics(newAnalytics);
    setStats(newAnalytics.stats);
    setHeatmap(newAnalytics.heatmap);
    setShotChart(newAnalytics.shotChart);

    if (onAnalyticsGenerated) {
      onAnalyticsGenerated(newAnalytics);
    }

    return newAnalytics;
  }, [shots, gameId, heatmapGridSize, onAnalyticsGenerated]);

  // Generate only shot stats (more efficient if only stats are needed)
  const generateStats = useCallback(() => {
    if (shots.length === 0) {
      return null;
    }

    const newStats = calculateShotStats(shots);
    setStats(newStats);
    return newStats;
  }, [shots]);

  // Generate only heatmap data
  const generateHeatmap = useCallback(() => {
    if (shots.length === 0) {
      return null;
    }

    const newHeatmap = generateHeatmapData(shots, heatmapGridSize);
    setHeatmap(newHeatmap);
    return newHeatmap;
  }, [shots, heatmapGridSize]);

  // Generate only shot chart data
  const generateShotChart = useCallback(() => {
    if (shots.length === 0) {
      return null;
    }

    const newShotChart = generateShotChartData(shots);
    setShotChart(newShotChart);
    return newShotChart;
  }, [shots]);

  // Export analytics data (e.g., for saving to file or sending to server)
  const exportAnalytics = useCallback(() => {
    if (!analytics) {
      const newAnalytics = generateAnalytics();
      if (!newAnalytics) return null;
      return JSON.stringify(newAnalytics);
    }
    return JSON.stringify(analytics);
  }, [analytics, generateAnalytics]);

  // Import analytics data (e.g., from file or server)
  const importAnalytics = useCallback((analyticsJson: string) => {
    try {
      const importedAnalytics = JSON.parse(analyticsJson) as GameAnalytics;
      setAnalytics(importedAnalytics);
      setStats(importedAnalytics.stats);
      setHeatmap(importedAnalytics.heatmap);
      setShotChart(importedAnalytics.shotChart);
      return true;
    } catch (error) {
      console.error('Failed to import analytics:', error);
      return false;
    }
  }, []);

  return {
    analytics,
    stats,
    heatmap,
    shotChart,
    generateAnalytics,
    generateStats,
    generateHeatmap,
    generateShotChart,
    exportAnalytics,
    importAnalytics,
  };
};
