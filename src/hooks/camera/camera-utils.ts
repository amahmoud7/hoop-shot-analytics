
import { toast } from '@/components/ui/use-toast';
import { getCameraStream } from '../../../court-vision-integration/src/lib/browser-compatibility';

/**
 * Request camera access with progressive enhancement
 * Tries a series of camera constraints from high quality to lower quality
 */
export const requestCameraAccess = async (
  isMobile: boolean,
  videoRef: React.RefObject<HTMLVideoElement>,
  onSuccess?: () => void
): Promise<boolean> => {
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
      
      return true;
    } else {
      console.error('No video element available');
      throw new Error("Video element not found");
    }
  } catch (error: any) {
    console.error('Error accessing camera:', error);
    toast({
      title: "Camera Access Denied",
      description: "Error: " + (error.message || "Could not access camera stream"),
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Set up video element metadata and play handlers
 */
export const setupVideoPlayback = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  isMobile: boolean,
  onSuccess: () => void,
  onRequiresInteraction: () => void
): Promise<void> => {
  if (!videoRef.current) return;
  
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
            onSuccess();
            
            toast({
              title: "Camera Ready",
              description: "Camera access enabled successfully",
            });
          })
          .catch(error => {
            console.error('Error playing video:', error);
            
            // For iOS, we need user interaction
            if (isMobile) {
              console.log("Mobile detected, showing manual play button");
              onRequiresInteraction();
              
              toast({
                title: "Tap to Start Camera",
                description: "Please tap the screen to start the camera",
                duration: 5000,
              });
            } else {
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
};

/**
 * Stop all camera tracks
 */
export const stopCameraStream = (videoRef: React.RefObject<HTMLVideoElement>): void => {
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      console.log("Stopping track:", track.kind);
      track.stop();
    });
  }
};
