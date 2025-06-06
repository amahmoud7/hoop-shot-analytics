
import React from 'react';
import { Camera, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deviceDetection } from '../../../court-vision-integration/src/lib/browser-compatibility/device-detection';

interface CameraActivatorProps {
  status: 'notRequested' | 'requesting' | 'granted' | 'denied';
  onActivate: () => void;
  isRequesting?: boolean;
}

const CameraActivator: React.FC<CameraActivatorProps> = ({ 
  status, 
  onActivate, 
  isRequesting = false 
}) => {
  const isIOS = deviceDetection.isIOS();
  
  // For granted state but not yet enabled (iOS manual play)
  if (status === 'granted') {
    return (
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black bg-opacity-70">
        <Play size={48} className="text-white" />
        <p className="text-white text-center px-4 mb-4">
          {isIOS ? 
            "Tap anywhere on the screen to start the camera (iOS requires user interaction)" :
            "Tap here to start the camera"
          }
        </p>
      </div>
    );
  }
  
  // Default state - camera not yet requested
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black bg-opacity-70">
      <Camera size={48} className="text-white" />
      <p className="text-white text-center px-4 mb-4">
        Enable camera to start tracking shots
        {isIOS && <span className="block mt-2 text-sm">On iOS, you'll need to tap again after granting permission</span>}
      </p>
      <Button 
        onClick={onActivate} 
        disabled={isRequesting}
        className="bg-basketball hover:bg-orange-600"
      >
        <Camera className="mr-2" />
        {isRequesting ? 'Requesting Access...' : 'Enable Camera'}
      </Button>
    </div>
  );
};

export default CameraActivator;
