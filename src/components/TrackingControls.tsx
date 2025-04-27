
import React from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import { GameStats } from '@/lib/types';

interface TrackingControlsProps {
  isRecording: boolean;
  stats: GameStats;
  onToggleRecording: () => void;
}

const TrackingControls: React.FC<TrackingControlsProps> = ({
  isRecording,
  stats,
  onToggleRecording
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
      {isRecording && (
        <div className="mb-4">
          <StatsCard stats={stats} compact={true} className="bg-opacity-90" />
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="ghost" 
          className="bg-white text-navy hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
        >
          <Plus size={24} />
        </Button>
        
        <Button
          className={`w-20 h-20 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-basketball hover:bg-orange-600'} text-white flex items-center justify-center`}
          onClick={onToggleRecording}
        >
          <Check size={32} />
        </Button>
        
        <Button 
          variant="ghost" 
          className="bg-white text-navy hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
        >
          <Minus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default TrackingControls;
