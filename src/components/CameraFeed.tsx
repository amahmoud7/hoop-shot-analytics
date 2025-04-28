
import React, { useEffect, useRef, useState } from 'react';

interface CameraFeedProps {
  onCameraReady?: () => void;
  onDetection?: (detection: any) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  onCameraReady,
  onDetection
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Placeholder for detection simulation (temporary)
  useEffect(() => {
    if (!isLoading && onDetection && Math.random() > 0.7) {
      // Simulate a detection event for demonstration purposes
      // This will be replaced by actual AI detection
      const simulatedDetection = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        radius: 5 + Math.random() * 3,
        confidence: 0.7 + Math.random() * 0.3,
        timestamp: Date.now()
      };
      
      // Send simulated detection periodically
      const detectionInterval = setInterval(() => {
        onDetection(simulatedDetection);
      }, 1000);
      
      return () => clearInterval(detectionInterval);
    }
  }, [isLoading, onDetection]);

  useEffect(() => {
    // Simulate camera initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onCameraReady) {
        onCameraReady();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onCameraReady]);

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Initializing camera...</div>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      )}
    </div>
  );
};

export default CameraFeed;
