
import { toast } from '@/components/ui/use-toast';
import { getCameraStream } from '../../../court-vision-integration/src/lib/browser-compatibility';
import { deviceDetection } from '../../../court-vision-integration/src/lib/browser-compatibility/device-detection';

/**
 * Request camera access with progressive enhancement
 * Tries a series of camera constraints from high quality to lower quality
 * Special handling for iOS devices, including iPhone 16 Pro Max
 */
export const requestCameraAccess = async (
  isMobile: boolean,
  videoRef: React.RefObject<HTMLVideoElement>,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    console.log("Requesting camera access...");
    
    // Check if video element exists before proceeding
    if (!videoRef.current) {
      console.error('Video element not found when trying to access camera');
      toast({
        title: "Camera Error",
        description: "Video element not found. Please try reloading the application.",
        variant: "destructive",
      });
      return false;
    }
    
    // Detect iOS devices specifically
    const isIOS = deviceDetection.isIOS();
    console.log("iOS device detected:", isIOS);
    
    // Use environment-facing camera by default on mobile devices
    const facingMode = isMobile ? "environment" : "user";
    console.log("Using facing mode:", facingMode);
    
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
      // iOS specific constraints
      {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      },
      // Last resort: Basic video with explicit device access preference
      { 
        video: {
          facingMode: { exact: facingMode }
        } 
      },
      // Absolute fallback
      { video: true }
    ];
    
    let stream = null;
    let errorMessage = "";
    
    // Try each constraint until one works
    for (const constraint of constraints) {
      try {
        console.log("Trying constraint:", constraint);
        stream = await getCameraStream(constraint);
        if (stream) {
          console.log("Stream obtained with constraint:", constraint);
          break;
        }
      } catch (e: any) {
        errorMessage = e.message || "Unknown error";
        console.warn("Failed with constraint:", constraint, e);
      }
    }
    
    if (!stream) {
      throw new Error(errorMessage || "Could not access camera with any constraints");
    }
    
    // Double-check video ref is still valid before setting stream
    if (!videoRef.current) {
      console.error('Video element disappeared during camera setup');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      throw new Error("Video element not found");
    }
    
    console.log("Stream obtained, setting to video element");
    
    // Wait for any previous srcObject to be cleaned up
    if (videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Set the stream to the video element
    videoRef.current.srcObject = stream;
    
    // Set additional attributes for iOS
    videoRef.current.setAttribute('playsinline', 'true');
    videoRef.current.setAttribute('webkit-playsinline', 'true');
    videoRef.current.muted = true;
    
    return true;
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
 * Enhanced for iOS devices, including iPhone 16 Pro Max
 */
export const setupVideoPlayback = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  isMobile: boolean,
  onSuccess: () => void,
  onRequiresInteraction: () => void
): Promise<void> => {
  // Check if video element exists
  if (!videoRef.current) {
    console.error('Video element not found during playback setup');
    return;
  }
  
  // Special handling for iOS
  const isIOS = deviceDetection.isIOS();
  
  // Set properties for iOS Safari
  if (isIOS && videoRef.current) {
    console.log("Applying iOS-specific video properties");
    videoRef.current.setAttribute('playsinline', 'true');
    videoRef.current.setAttribute('webkit-playsinline', 'true');
    videoRef.current.muted = true;
    videoRef.current.playsInline = true;
  }
  
  // Ensure video plays when ready
  videoRef.current.onloadedmetadata = () => {
    // Check again if video element still exists
    if (!videoRef.current) {
      console.error('Video element disappeared during metadata loading');
      return;
    }
    
    console.log("Video metadata loaded, trying to play");
    
    // For iOS, trigger user interaction mode immediately
    // This avoids autoplay restrictions by showing an interaction prompt
    if (isIOS) {
      console.log("iOS device detected, preparing for manual interaction");
      onRequiresInteraction();
      
      // Still attempt autoplay in case we're in a PWA or have permission
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Camera started successfully on iOS - autoplay worked");
            onSuccess();
          })
          .catch(error => {
            console.log("Expected autoplay error on iOS:", error);
            // This is normal on iOS - we'll wait for user interaction
          });
      }
    } else {
      // Try to play the video immediately for non-iOS
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Camera started successfully - autoplay worked");
            onSuccess();
            
            toast({
              title: "Camera Ready",
              description: "Camera access enabled successfully",
            });
          })
          .catch(error => {
            console.error('Error playing video:', error);
            
            // For mobile that's not iOS, show manual play option
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
    videoRef.current.srcObject = null;
  }
};
