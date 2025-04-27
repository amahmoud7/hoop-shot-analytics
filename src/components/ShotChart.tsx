
import React from 'react';
import { Shot } from '@/lib/types';

interface ShotChartProps {
  shots: Shot[];
  width?: number;
  height?: number;
  showLegend?: boolean;
}

const ShotChart: React.FC<ShotChartProps> = ({ 
  shots, 
  width = 300, 
  height = 200, 
  showLegend = true 
}) => {
  // Group shots by position for heatmap calculation
  const gridSize = 10; // 10x10 grid for heatmap
  const shotGrid: Record<string, { count: number, makes: number }> = {};
  
  shots.forEach(shot => {
    // Round to nearest grid position
    const gridX = Math.floor(shot.x / gridSize);
    const gridY = Math.floor(shot.y / gridSize);
    const key = `${gridX}-${gridY}`;
    
    if (!shotGrid[key]) {
      shotGrid[key] = { count: 0, makes: 0 };
    }
    
    shotGrid[key].count += 1;
    if (shot.isMade) {
      shotGrid[key].makes += 1;
    }
  });
  
  // Find max shots in any grid cell for color intensity
  let maxShotsInCell = 1;
  Object.values(shotGrid).forEach(cell => {
    if (cell.count > maxShotsInCell) {
      maxShotsInCell = cell.count;
    }
  });

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-court border-2 border-court-lines rounded-md overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Court markings */}
        <div className="absolute bottom-0 left-[25%] w-[50%] h-[20%] bg-court-key opacity-70"></div>
        <div className="absolute bottom-[20%] left-[25%] w-[50%] h-0.5 bg-court-lines"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-court-lines"></div>
        
        {/* Three-point line */}
        <div className="absolute border-2 border-court-lines rounded-t-full bottom-0 left-1/2 transform -translate-x-1/2 w-[75%] h-[40%]"></div>
        
        {/* Rim */}
        <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white"></div>
        
        {/* Heatmap overlay */}
        {Object.entries(shotGrid).map(([key, data]) => {
          const [gridX, gridY] = key.split('-').map(Number);
          const x = gridX * gridSize + (gridSize / 2);
          const y = gridY * gridSize + (gridSize / 2);
          const intensity = data.count / maxShotsInCell;
          const percentage = data.makes / data.count;
          
          // Color based on shooting percentage
          let color;
          if (percentage >= 0.5) {
            // Green for good shooting (50%+)
            color = `rgba(39, 174, 96, ${intensity})`;
          } else {
            // Red for poor shooting (below 50%)
            color = `rgba(231, 76, 60, ${intensity})`;
          }
          
          return (
            <div 
              key={key}
              className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${10 + (intensity * 15)}px`,
                height: `${10 + (intensity * 15)}px`,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
      
      {showLegend && (
        <div className="flex justify-between w-full mt-3 px-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-xs">Cold (&lt;50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">Hot (≥50%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShotChart;
