
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCameraStream } from '../../court-vision-integration/src/lib/browser-compatibility';
import { toast } from '@/components/ui/use-toast';

interface CameraFeedProps {
  onCameraReady?: () => void;
  onDetection?: (detection: any) => void;
  autoStart?: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  onCameraReady,
  onDetection,
  autoStart = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'notRequested' | 'requesting' | 'granted' | 'denied'>('notRequested');
  
  // Request camera access
  const requestCameraAccess = async () => {
    if (cameraStatus === 'requesting') return;
    
    setCameraStatus('requesting');
    setIsLoading(true);
    
    try {
      const stream = await getCameraStream({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays when ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setCameraStatus('granted');
                setCameraEnabled(true);
                console.log("Camera started successfully");
                toast({
                  title: "Camera Ready",
                  description: "Camera access enabled successfully",
                });
                
                if (onCameraReady) {
                  onCameraReady();
                }
              })
              .catch(error => {
                console.error('Error playing video:', error);
                setCameraStatus('denied');
                toast({
                  title: "Camera Error",
                  description: "Could not start video stream: " + error.message,
                  variant: "destructive",
                });
              });
          }
        };
      } else {
        console.error('No stream or video element available');
        setCameraStatus('denied');
        toast({
          title: "Camera Error",
          description: "Could not access camera stream",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraStatus('denied');
      toast({
        title: "Camera Access Denied",
        description: "Please enable camera access in browser settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-start camera if enabled
  useEffect(() => {
    if (autoStart && cameraStatus === 'notRequested') {
      requestCameraAccess();
    }
    
    // Cleanup camera on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [autoStart]);

  // Placeholder for detection simulation (temporary)
  useEffect(() => {
    if (cameraEnabled && onDetection) {
      // Simulate a detection event for demonstration purposes
      const detectionInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const simulatedDetection = {
            x: Math.random() * 100,
            y: Math.random() * 100,
            radius: 5 + Math.random() * 3,
            confidence: 0.7 + Math.random() * 0.3,
            timestamp: Date.now()
          };
          
          onDetection(simulatedDetection);
        }
      }, 1000);
      
      return () => clearInterval(detectionInterval);
    }
  }, [cameraEnabled, onDetection]);

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Initializing camera...</div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            style={{ display: cameraEnabled ? 'block' : 'none' }}
          />
          
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black bg-opacity-70">
              {cameraStatus === 'denied' ? (
                <>
                  <CameraOff size={48} className="text-red-500" />
                  <p className="text-white text-center px-4">
                    Camera access denied. Please enable camera access in your browser settings.
                  </p>
                </>
              ) : (
                <>
                  <Camera size={48} className="text-white" />
                  <p className="text-white mb-4">
                    Enable camera to start tracking shots
                  </p>
                  <Button 
                    onClick={requestCameraAccess} 
                    disabled={cameraStatus === 'requesting'}
                    className="bg-basketball hover:bg-orange-600"
                  >
                    <Camera className="mr-2" />
                    {cameraStatus === 'requesting' ? 'Requesting Access...' : 'Enable Camera'}
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraFeed;
