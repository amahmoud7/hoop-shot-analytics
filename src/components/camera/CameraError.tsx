
import React from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraErrorProps {
  message?: string;
  onRetry: () => void;
}

const CameraError: React.FC<CameraErrorProps> = ({ 
  message = "Camera access denied. Please ensure you've granted camera permissions in your browser settings.", 
  onRetry 
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black bg-opacity-70">
      <CameraOff size={48} className="text-red-500" />
      <p className="text-white text-center px-4">
        {message}
      </p>
      <Button 
        onClick={onRetry} 
        className="bg-basketball hover:bg-orange-600 mt-4"
      >
        <Camera className="mr-2" />
        Try Again
      </Button>
    </div>
  );
};

export default CameraError;
