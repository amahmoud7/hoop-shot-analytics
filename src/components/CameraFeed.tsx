
import React, { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import CameraError from '@/components/camera/CameraError';
import CameraActivator from '@/components/camera/CameraActivator';
import DetectionSimulator from '@/components/camera/DetectionSimulator';
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
  const {
    videoRef,
    isLoading,
    cameraEnabled,
    cameraStatus,
    isIOS,
    requestCameraAccess,
    handleManualPlay
  } = useCamera({ 
    autoStart, 
    onCameraReady 
  });

  // Handle iOS-specific interactions
  useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in CameraFeed");
      // Add a one-time touch event listener to the document for iOS
      const handleDocumentTouch = () => {
        if (cameraStatus === 'granted' && !cameraEnabled) {
          console.log("Document touched, attempting to play video");
          handleManualPlay();
        }
      };
      
      document.addEventListener('touchstart', handleDocumentTouch, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleDocumentTouch);
      };
    }
  }, [isIOS, cameraStatus, cameraEnabled, handleManualPlay]);

  // Display guidance toast for iOS users
  useEffect(() => {
    if (isIOS && cameraStatus === 'granted' && !cameraEnabled) {
      toast({
        title: "iOS Camera",
        description: "Please tap the screen to activate the camera",
        duration: 5000,
      });
    }
  }, [isIOS, cameraStatus, cameraEnabled]);

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center"
      onClick={cameraStatus === 'granted' && !cameraEnabled ? handleManualPlay : undefined}
    >
      {/* Always render video element with correct attributes for iOS */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${cameraStatus === 'granted' ? 'block' : 'hidden'}`}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted
      />
      
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Initializing camera...</div>
        </div>
      ) : (
        <>
          {cameraStatus !== 'granted' || !cameraEnabled ? (
            cameraStatus === 'denied' ? (
              <CameraError onRetry={requestCameraAccess} />
            ) : (
              <CameraActivator 
                status={cameraStatus} 
                onActivate={requestCameraAccess} 
                isRequesting={cameraStatus === 'requesting'} 
              />
            )
          ) : null}
          
          <DetectionSimulator 
            enabled={cameraEnabled} 
            onDetection={onDetection} 
          />
        </>
      )}
    </div>
  );
};

export default CameraFeed;
