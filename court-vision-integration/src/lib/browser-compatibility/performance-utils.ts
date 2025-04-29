
/**
 * Performance optimization utilities based on device capabilities
 */
import { browserCapabilities } from './browser-capabilities';
import { deviceDetection } from './device-detection';

// Performance optimization based on device capabilities
export const getOptimalPerformanceSettings = () => {
  const isMobile = deviceDetection.isMobileDevice();
  const hasWebGL = browserCapabilities.hasWebGL();
  const hasWorkers = browserCapabilities.hasWebWorkers();
  
  return {
    // Inference frequency (frames per second)
    detectionFps: isMobile ? 5 : 10,
    
    // Resolution scale factor (1.0 = full resolution)
    resolutionScale: isMobile ? 0.5 : 0.75,
    
    // Whether to use WebGL acceleration if available
    useWebGL: hasWebGL,
    
    // Whether to use Web Workers for processing
    useWorkers: hasWorkers,
    
    // Maximum trajectory points to store (memory consideration)
    maxTrajectoryPoints: isMobile ? 30 : 60,
    
    // Visualization detail level (1-3)
    visualizationDetail: isMobile ? 1 : 3
  };
};
