
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface CameraFeedProps {
  onCameraReady?: () => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCameraReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        onCameraReady?.();
        
        toast({
          title: "Camera Started",
          description: "The camera feed is now active",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access the camera. Please check permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      
      toast({
        title: "Camera Stopped",
        description: "The camera feed has been stopped",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={isStreaming ? stopCamera : startCamera}
          variant="outline"
          size="lg"
          className="bg-white/90 hover:bg-white"
        >
          {isStreaming ? (
            <>
              <CameraOff className="mr-2 h-5 w-5" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Start Camera
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CameraFeed;
