
/**
 * Camera access utilities with cross-browser compatibility
 */
import { deviceDetection } from './device-detection';

// Camera access with fallbacks
export const getCameraStream = async (constraints: MediaStreamConstraints = { 
  video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
}): Promise<MediaStream | null> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('WebRTC is not supported in this browser');
    return null;
  }

  // Special handling for iOS Safari
  const isIOS = deviceDetection.isIOS();
  
  if (isIOS) {
    console.log("iOS detected, using specialized camera handling");
  }

  try {
    // Try with provided constraints first
    console.log("Attempting to get camera with constraints:", JSON.stringify(constraints));
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.warn('Failed to get camera with ideal constraints, trying fallback', error);
    
    // For iOS, try a more specific fallback
    if (isIOS) {
      try {
        console.log("Trying iOS-specific fallback");
        // iOS specific constraints
        return await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (iosError) {
        console.warn('iOS fallback failed, trying basic video', iosError);
      }
    }
    
    try {
      // Basic fallback as last resort
      console.log("Trying basic video fallback");
      return await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (fallbackError) {
      console.error('Camera access failed with all fallback constraints', fallbackError);
      return null;
    }
  }
};

// Try to get any available camera from device
export const getAnyCameraStream = async (): Promise<MediaStream | null> => {
  const constraints = [
    // First try: environment camera
    {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    // Second try: front camera
    {
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    // Third try: Any camera, lower resolution
    {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    },
    // Last resort
    { video: true }
  ];
  
  for (const constraint of constraints) {
    try {
      console.log("Trying to get camera with constraint:", JSON.stringify(constraint));
      const stream = await navigator.mediaDevices.getUserMedia(constraint);
      if (stream) {
        console.log("Successfully got camera stream");
        return stream;
      }
    } catch (e) {
      console.warn("Failed to get camera with constraint:", constraint, e);
    }
  }
  
  console.error("Could not get any camera stream after trying all fallbacks");
  return null;
};
