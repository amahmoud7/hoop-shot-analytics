
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { applyBrowserWorkarounds } from '../../court-vision-integration/src/lib/browser-compatibility';
import { requestCameraAccess, setupVideoPlayback, stopCameraStream } from './camera/camera-utils';

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

  // Apply iOS and other browser-specific fixes on component mount
  useEffect(() => {
    applyBrowserWorkarounds();
  }, []);
  
  // Request camera access
  const requestAccess = async () => {
    if (cameraStatus === 'requesting') return;
    
    setCameraStatus('requesting');
    setIsLoading(true);
    
    try {
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
        });
    }
  };

  // Auto-start camera if enabled
  useEffect(() => {
    if (autoStart && cameraStatus === 'notRequested') {
      requestAccess();
    }
    
    // Cleanup camera on unmount
    return () => {
      stopCameraStream(videoRef);
    };
  }, [autoStart]);

  return {
    videoRef,
    isLoading,
    cameraEnabled,
    cameraStatus,
    requestCameraAccess: requestAccess,
    handleManualPlay
  };
};
