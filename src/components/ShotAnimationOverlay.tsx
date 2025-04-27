
import React from 'react';

interface ShotAnimationOverlayProps {
  x: number;
  y: number;
  visible: boolean;
}

const ShotAnimationOverlay: React.FC<ShotAnimationOverlayProps> = ({ x, y, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="absolute w-5 h-5 bg-basketball rounded-full animate-pulse"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="h-32 w-px border-r border-dashed border-white absolute bottom-full left-1/2 transform -translate-x-1/2 animate-shot-arc"></div>
    </div>
  );
};

export default ShotAnimationOverlay;
