
import React from 'react';
import { useCamera } from '@/hooks/useCamera';
import CameraError from '@/components/camera/CameraError';
import CameraActivator from '@/components/camera/CameraActivator';
import DetectionSimulator from '@/components/camera/DetectionSimulator';

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
    requestCameraAccess,
    handleManualPlay
  } = useCamera({ 
    autoStart, 
    onCameraReady 
  });

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center"
      onClick={cameraStatus === 'granted' && !cameraEnabled ? handleManualPlay : undefined}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Initializing camera...</div>
        </div>
      ) : (
        <>
          {/* Always render the video element, but hide it when not active */}
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
