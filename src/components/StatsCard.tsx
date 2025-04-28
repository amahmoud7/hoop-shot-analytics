
import React from 'react';
import { ShotStats } from '@/lib/courtVision';

interface StatsCardProps {
  stats: ShotStats;
  compact?: boolean;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  stats, 
  compact = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow ${className}`}>
      <h3 className="text-navy font-bold text-lg mb-2">Shooting Stats</h3>
      
      {compact ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">FG%</p>
            <p className="font-bold text-navy">{stats.shotPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">2PT%</p>
            <p className="font-bold text-navy">{stats.twoPointPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">3PT%</p>
            <p className="font-bold text-navy">{stats.threePointPercentage.toFixed(1)}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Field Goals</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{stats.madeShots}/{stats.totalShots}</span>
              <span className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
                {stats.shotPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">2-Point</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{stats.twoPointMade}/{stats.twoPointAttempts}</span>
              <span className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
                {stats.twoPointPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">3-Point</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{stats.threePointMade}/{stats.threePointAttempts}</span>
              <span className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
                {stats.threePointPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Points</span>
              <span className="font-bold text-navy">
                {stats.pointsScored}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
