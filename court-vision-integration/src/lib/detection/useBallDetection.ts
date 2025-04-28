import { useState, useEffect, useRef, useCallback } from 'react';
import { BallDetector } from './ballDetector';
import { BallDetection, ModelConfig } from './types';

interface UseBallDetectionProps {
  videoElementRef: React.RefObject<HTMLVideoElement>;
  canvasElementRef?: React.RefObject<HTMLCanvasElement>; // Optional for visualization
  modelConfig?: Partial<ModelConfig>;
  confidenceThreshold?: number;
  iouThreshold?: number;
  detectionIntervalMs?: number; // Interval between detections
  autoStart?: boolean; // Start detection automatically
  onDetection?: (detections: BallDetection[]) => void; // Callback for each detection
}

export const useBallDetection = ({
  videoElementRef,
  canvasElementRef,
  modelConfig,
  confidenceThreshold,
  iouThreshold,
  detectionIntervalMs = 100, // Default to 10 detections per second
  autoStart = true,
  onDetection,
}: UseBallDetectionProps) => {
  const [detector, setDetector] = useState<BallDetector | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [detections, setDetections] = useState<BallDetection[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const detectionLoopRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Initialize Detector
  useEffect(() => {
    const newDetector = new BallDetector(
      modelConfig,
      confidenceThreshold,
      iouThreshold
    );
    setDetector(newDetector);

    // Load model immediately
    setIsLoadingModel(true);
    newDetector.loadModel()
      .then(() => {
        if (isMountedRef.current) {
          setIsModelLoaded(true);
          setIsLoadingModel(false);
          console.log('Ball detection model ready.');
          if (autoStart) {
            startDetection();
          }
        }
      })
      .catch(error => {
        if (isMountedRef.current) {
          console.error('Failed to load ball detection model:', error);
          setIsLoadingModel(false);
        }
      });

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
      newDetector.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelConfig, confidenceThreshold, iouThreshold, autoStart]); // Re-init if config changes

  // Detection Loop Logic
  const runDetection = useCallback(async () => {
    if (!detector || !isModelLoaded || !videoElementRef.current || !isDetecting) {
      return;
    }

    const videoElement = videoElementRef.current;
    if (videoElement.readyState < videoElement.HAVE_METADATA) {
        // Video not ready yet
        detectionLoopRef.current = requestAnimationFrame(runDetection);
        return;
    }

    const startTime = performance.now();

    try {
      const currentDetections = await detector.detectBall(videoElement);
      if (isMountedRef.current) {
        setDetections(currentDetections);
        if (onDetection) {
          onDetection(currentDetections);
        }

        // Optional: Visualize on canvas
        if (canvasElementRef?.current) {
          visualizeDetections(canvasElementRef.current, videoElement, currentDetections);
        }
      }
    } catch (error) {
      console.error('Error in detection loop:', error);
    }

    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    // Adjust next frame timing based on interval and processing time
    const delay = Math.max(0, detectionIntervalMs - elapsedTime);

    // Schedule next frame
    detectionLoopRef.current = window.setTimeout(() => {
        detectionLoopRef.current = requestAnimationFrame(runDetection);
    }, delay);

  }, [detector, isModelLoaded, videoElementRef, isDetecting, onDetection, canvasElementRef, detectionIntervalMs]);

  // Start Detection
  const startDetection = useCallback(() => {
    if (isDetecting || !isModelLoaded || isLoadingModel) return;
    console.log('Starting ball detection...');
    setIsDetecting(true);
    // Use requestAnimationFrame for smoother looping tied to display refresh rate
    detectionLoopRef.current = requestAnimationFrame(runDetection);
  }, [isDetecting, isModelLoaded, isLoadingModel, runDetection]);

  // Stop Detection
  const stopDetection = useCallback(() => {
    if (!isDetecting) return;
    console.log('Stopping ball detection...');
    setIsDetecting(false);
    if (detectionLoopRef.current) {
      // Clear both timeout and animation frame just in case
      clearTimeout(detectionLoopRef.current);
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
  }, [isDetecting]);

  // Visualization Helper (Optional)
  const visualizeDetections = (
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    dets: BallDetection[]
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video display size
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    // Scale factor if video element size differs from its natural resolution
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    // Draw video frame first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw detections
    dets.forEach(det => {
      const x = det.x * scaleX;
      const y = det.y * scaleY;
      const radius = det.radius * Math.min(scaleX, scaleY); // Scale radius appropriately

      // Draw bounding circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill with semi-transparent color
      // ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
      // ctx.fill();

      // Draw confidence text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(
        `Ball: ${Math.round(det.confidence * 100)}%`,
        x - radius,
        y - radius - 5
      );
    });
  };

  return {
    detections,
    isModelLoaded,
    isLoadingModel,
    isDetecting,
    startDetection,
    stopDetection,
  };
};

