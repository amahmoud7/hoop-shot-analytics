
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { applyBrowserWorkarounds } from '../../court-vision-integration/src/lib/browser-compatibility/workarounds';
import { requestCameraAccess, setupVideoPlayback, stopCameraStream } from './camera/camera-utils';
import { deviceDetection } from '../../court-vision-integration/src/lib/browser-compatibility/device-detection';

export type CameraStatus = 'notRequested' | 'requesting' | 'granted' | 'denied';

export interface UseCameraProps {
  autoStart?: boolean;
  onCameraReady?: () => void;
}

export const useCamera = ({ autoStart = false, onCameraReady }: UseCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('notRequested');
  const isMobile = useIsMobile();
  const isIOS = deviceDetection.isIOS();
  
  // Apply iOS and other browser-specific fixes on component mount
  useEffect(() => {
    console.log("Applying browser workarounds, iOS device:", isIOS);
    applyBrowserWorkarounds();
  }, [isIOS]);
  
  // Request camera access
  const requestAccess = async () => {
    if (cameraStatus === 'requesting') return;
    
    setCameraStatus('requesting');
    setIsLoading(true);
    
    try {
      console.log("Video ref exists before request:", !!videoRef.current);
      const success = await requestCameraAccess(isMobile, videoRef);
      
      if (success) {
        await setupVideoPlayback(
          videoRef, 
          isMobile,
          () => {
            setCameraStatus('granted');
            setCameraEnabled(true);
            if (onCameraReady) {
              onCameraReady();
            }
          },
          () => {
            // For iOS or other devices requiring interaction
            setCameraStatus('granted'); // We have the stream, just need interaction
            console.log("iOS mode: Camera ready but requires user interaction");
          }
        );
        
        // Set up error handler for the video element
        if (videoRef.current) {
          videoRef.current.onerror = (event) => {
            console.error('Video element error:', event);
            setCameraStatus('denied');
          };
        }
      } else {
        setCameraStatus('denied');
      }
    } catch (error) {
      console.error('Error in camera setup:', error);
      setCameraStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual play handler for iOS
  const handleManualPlay = () => {
    if (!videoRef.current) {
      console.error('Video element not found during manual play');
      return;
    }
    
    if (videoRef.current.srcObject) {
      console.log("Attempting manual play...");
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
          // On iOS, we need to try again with a different approach
          if (isIOS && videoRef.current) {
            console.log("Using iOS fallback approach for manual play");
            // Temporary mute (should already be muted, but ensuring)
            videoRef.current.muted = true;
            
            // This timeout helps with iOS Safari quirks
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    setCameraEnabled(true);
                    setCameraStatus('granted');
                    console.log("iOS fallback play succeeded");
                    if (onCameraReady) {
                      onCameraReady();
                    }
                  })
                  .catch(fallbackErr => {
                    console.error('iOS fallback play failed:', fallbackErr);
                  });
              }
            }, 100);
          }
        });
    } else {
      console.error('No video stream available for manual play');
    }
  };

  // Auto-start camera if enabled
  useEffect(() => {
    if (autoStart && cameraStatus === 'notRequested') {
      console.log("Auto-starting camera access");
      requestAccess();
    }
    
    // Cleanup camera on unmount
    return () => {
      stopCameraStream(videoRef);
    };
  }, [autoStart, cameraStatus]);

  return {
    videoRef,
    isLoading,
    cameraEnabled,
    cameraStatus,
    isIOS,
    requestCameraAccess: requestAccess,
    handleManualPlay
  };
};
