
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCameraStream, applyBrowserWorkarounds } from '../../court-vision-integration/src/lib/browser-compatibility';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Apply iOS and other browser-specific fixes on component mount
  useEffect(() => {
    applyBrowserWorkarounds();
  }, []);
  
  // Manual play handler for iOS
  const handleManualPlay = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play()
        .then(() => {
          setCameraEnabled(true);
          setCameraStatus('granted');
          console.log("Manual play succeeded");
          if (onCameraReady) {
            onCameraReady();
          }
        })
        .catch(err => {
          console.error('Manual play error:', err);
          toast({
            title: "Camera Error",
            description: "Could not start video playback: " + err.message,
            variant: "destructive",
          });
        });
    }
  };
  
  // Request camera access
  const requestCameraAccess = async () => {
    if (cameraStatus === 'requesting') return;
    
    setCameraStatus('requesting');
    setIsLoading(true);
    
    try {
      console.log("Requesting camera access...");
      
      // Use environment-facing camera by default on mobile devices
      const facingMode = isMobile ? "environment" : "user";
      
      // Try different camera constraints in order of preference
      const constraints = [
        // First try: HD with environment camera on mobile
        {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Second try: Standard resolution
        {
          video: {
            facingMode: facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Last resort: Basic video
        { video: true }
      ];
      
      let stream = null;
      let errorMessage = "";
      
      // Try each constraint until one works
      for (const constraint of constraints) {
        try {
          console.log("Trying constraint:", constraint);
          stream = await getCameraStream(constraint);
          if (stream) break;
        } catch (e: any) {
          errorMessage = e.message || "Unknown error";
          console.warn("Failed with constraint:", constraint, e);
        }
      }
      
      if (!stream) {
        throw new Error(errorMessage || "Could not access camera with any constraints");
      }
      
      if (videoRef.current) {
        console.log("Stream obtained, setting to video element");
        videoRef.current.srcObject = stream;
        
        // Set additional attributes for iOS
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        
        // Ensure video plays when ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("Video metadata loaded, trying to play");
            // Try to play the video immediately
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Camera started successfully - auto play worked");
                  setCameraStatus('granted');
                  setCameraEnabled(true);
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
                  
                  // For iOS, we need user interaction
                  if (isMobile) {
                    console.log("Mobile detected, showing manual play button");
                    setCameraStatus('granted'); // We have the stream, just need interaction
                    // Don't set cameraEnabled yet - wait for manual play
                    
                    toast({
                      title: "Tap to Start Camera",
                      description: "Please tap the screen to start the camera",
                      duration: 5000,
                    });
                  } else {
                    setCameraStatus('denied');
                    toast({
                      title: "Camera Error",
                      description: "Could not start video stream: " + error.message,
                      variant: "destructive",
                    });
                  }
                });
            }
          }
        };
        
        // Add error handler for the video element
        videoRef.current.onerror = (event) => {
          console.error('Video element error:', event);
          setCameraStatus('denied');
          toast({
            title: "Camera Error",
            description: "Video element error occurred",
            variant: "destructive",
          });
        };
      } else {
        console.error('No video element available');
        throw new Error("Video element not found");
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setCameraStatus('denied');
      toast({
        title: "Camera Access Denied",
        description: "Error: " + (error.message || "Could not access camera stream"),
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
        stream.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });
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
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center"
      onClick={handleManualPlay}
    >
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
            webkit-playsinline="true"
            muted
            style={{ display: cameraStatus === 'granted' ? 'block' : 'none' }}
          />
          
          {cameraStatus !== 'granted' || !cameraEnabled ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 bg-black bg-opacity-70">
              {cameraStatus === 'denied' ? (
                <>
                  <CameraOff size={48} className="text-red-500" />
                  <p className="text-white text-center px-4">
                    Camera access denied. Please ensure you've granted camera permissions in your browser settings.
                  </p>
                  <Button 
                    onClick={requestCameraAccess} 
                    className="bg-basketball hover:bg-orange-600 mt-4"
                  >
                    <Camera className="mr-2" />
                    Try Again
                  </Button>
                </>
              ) : cameraStatus === 'granted' && !cameraEnabled ? (
                <>
                  <Play size={48} className="text-white" />
                  <p className="text-white mb-4">
                    Tap here to start the camera
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
          ) : null}
        </>
      )}
    </div>
  );
};

export default CameraFeed;
