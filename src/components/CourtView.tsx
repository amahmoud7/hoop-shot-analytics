
import React from 'react';
import { Shot } from '@/lib/types';

interface CourtViewProps {
  shots?: Shot[];
  onCourtPress?: (x: number, y: number) => void;
  showThreePointLine?: boolean;
  isHalfCourt?: boolean;
  showShotMarkers?: boolean;
  interactive?: boolean;
  className?: string;
}

const CourtView: React.FC<CourtViewProps> = ({
  shots = [],
  onCourtPress,
  showThreePointLine = true,
  isHalfCourt = true,
  showShotMarkers = true,
  interactive = false,
  className = "",
}) => {
  const courtRef = React.useRef<HTMLDivElement>(null);

  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onCourtPress || !courtRef.current) return;
    
    const rect = courtRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onCourtPress(x, y);
  };

  return (
    <div 
      ref={courtRef}
      className={`court-container ${className} ${interactive ? 'cursor-crosshair' : ''}`}
      onClick={handleCourtClick}
    >
      <div className="court-half">
        {/* Baseline */}
        <div className="court-line absolute bottom-0 left-0 w-full h-1"></div>
        
        {/* Free throw line */}
        <div className="court-line absolute bottom-[20%] left-[25%] w-[50%] h-1"></div>
        
        {/* Key/Paint area */}
        <div className="court-key absolute bottom-0 left-[25%] w-[50%] h-[20%]"></div>
        
        {/* Backboard */}
        <div className="court-line absolute bottom-[2%] left-[40%] w-[20%] h-1"></div>
        
        {/* Rim */}
        <div className="absolute bottom-[5%] left-[50%] w-3 h-3 bg-white rounded-full transform -translate-x-1/2"></div>
        
        {showThreePointLine && (
          <div className="three-point-line"></div>
        )}
        
        {!isHalfCourt && (
          <>
            <div className="center-circle"></div>
            <div className="court-line absolute top-1/2 left-0 w-full h-1"></div>
          </>
        )}
        
        {/* Shot markers */}
        {showShotMarkers && shots.map((shot) => (
          <div
            key={shot.id}
            className={`shot-marker ${shot.isMade ? 'make' : 'miss'}`}
            style={{
              left: `${shot.x}%`,
              top: `${shot.y}%`,
              width: shot.isThreePoint ? '12px' : '10px',
              height: shot.isThreePoint ? '12px' : '10px',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CourtView;
