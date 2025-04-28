
import React from 'react';
import { Camera, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import { ShotStats } from '@/lib/courtVision';

interface TrackingControlsProps {
  isRecording: boolean;
  stats: ShotStats;
  onToggleRecording: () => void;
  cameraEnabled?: boolean;
  onRequestCamera?: () => void;
}

const TrackingControls: React.FC<TrackingControlsProps> = ({
  isRecording,
  stats,
  onToggleRecording,
  cameraEnabled = false,
  onRequestCamera
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
      {isRecording && (
        <div className="mb-4">
          <StatsCard stats={stats} compact={true} className="bg-opacity-90" />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {/* Left button - kept empty for now */}
        <div className="w-12 h-12"></div>
        
        {/* Center button - main action */}
        {!cameraEnabled ? (
          <Button
            className="w-20 h-20 rounded-full bg-basketball hover:bg-orange-600 text-white flex items-center justify-center"
            onClick={onRequestCamera}
          >
            <Camera size={32} />
          </Button>
        ) : (
          <Button
            className={`w-20 h-20 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-basketball hover:bg-orange-600'} text-white flex items-center justify-center`}
            onClick={onToggleRecording}
          >
            {isRecording ? <Square size={32} /> : <Play size={32} />}
          </Button>
        )}
        
        {/* Right button - kept empty for now */}
        <div className="w-12 h-12"></div>
      </div>
    </div>
  );
};

export default TrackingControls;
