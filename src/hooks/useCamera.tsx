
import { useState, useEffect, useRef } from 'react';
import { getCameraStream, applyBrowserWorkarounds } from '../../court-vision-integration/src/lib/browser-compatibility';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

type CameraStatus = 'notRequested' | 'requesting' | 'granted' | 'denied';

interface UseCameraProps {
  autoStart?: boolean;
  onCameraReady?: () => void;
}

export const useCamera = ({ autoStart = false, onCameraReady }: UseCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('notRequested');
  const isMobile = useIsMobile();

  // Apply iOS and other browser-specific fixes on component mount
  useEffect(() => {
    applyBrowserWorkarounds();
  }, []);
  
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

  return {
    videoRef,
    isLoading,
    cameraEnabled,
    cameraStatus,
    requestCameraAccess,
    handleManualPlay
  };
};
