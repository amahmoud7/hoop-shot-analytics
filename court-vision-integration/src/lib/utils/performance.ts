/**
 * Performance optimization utilities for basketball tracking
 * 
 * This file contains utilities to optimize the performance of the basketball tracking
 * functionality, especially on mobile devices or lower-end hardware.
 */

/**
 * Determines the optimal detection interval based on device capabilities
 * @param isMobile Whether the device is a mobile device
 * @param hasWebGL Whether the device supports WebGL
 * @returns Optimal detection interval in milliseconds
 */
export const getOptimalDetectionInterval = (isMobile: boolean, hasWebGL: boolean): number => {
  if (isMobile) {
    return hasWebGL ? 150 : 250; // 6.6 fps or 4 fps on mobile
  } else {
    return hasWebGL ? 80 : 120; // 12.5 fps or 8.3 fps on desktop
  }
};

/**
 * Determines the optimal resolution scale for video processing
 * @param isMobile Whether the device is a mobile device
 * @param deviceMemory Available device memory in GB (if available)
 * @returns Scale factor for video resolution (0.0-1.0)
 */
export const getOptimalResolutionScale = (
  isMobile: boolean, 
  deviceMemory?: number
): number => {
  // Use deviceMemory if available (part of Navigator API, not available in all browsers)
  if (deviceMemory !== undefined) {
    if (deviceMemory <= 2) return 0.4;
    if (deviceMemory <= 4) return 0.6;
    if (deviceMemory <= 8) return 0.8;
    return 1.0;
  }
  
  // Fallback based on device type
  return isMobile ? 0.5 : 0.75;
};

/**
 * Determines whether to use WebGL for rendering and processing
 * @param hasWebGL Whether the device supports WebGL
 * @returns Whether to use WebGL
 */
export const shouldUseWebGL = (hasWebGL: boolean): boolean => {
  return hasWebGL;
};

/**
 * Determines whether to use Web Workers for processing
 * @param hasWorkers Whether the device supports Web Workers
 * @returns Whether to use Web Workers
 */
export const shouldUseWebWorkers = (hasWorkers: boolean): boolean => {
  return hasWorkers;
};

/**
 * Determines the optimal confidence threshold for ball detection
 * @param isMobile Whether the device is a mobile device
 * @returns Optimal confidence threshold (0.0-1.0)
 */
export const getOptimalConfidenceThreshold = (isMobile: boolean): number => {
  return isMobile ? 0.6 : 0.5; // Higher threshold on mobile to reduce false positives
};

/**
 * Determines the optimal number of trajectory points to store
 * @param isMobile Whether the device is a mobile device
 * @returns Optimal number of trajectory points
 */
export const getOptimalTrajectoryPointCount = (isMobile: boolean): number => {
  return isMobile ? 30 : 60;
};

/**
 * Determines the optimal visualization detail level
 * @param isMobile Whether the device is a mobile device
 * @param hasWebGL Whether the device supports WebGL
 * @returns Visualization detail level (1-3)
 */
export const getOptimalVisualizationDetail = (
  isMobile: boolean, 
  hasWebGL: boolean
): number => {
  if (isMobile) {
    return hasWebGL ? 2 : 1;
  } else {
    return hasWebGL ? 3 : 2;
  }
};

/**
 * Debounce function to limit the frequency of function calls
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function to limit the frequency of function calls
 * @param func Function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Memoize function to cache function results
 * @param func Function to memoize
 * @returns Memoized function
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Get all performance optimization settings based on device capabilities
 * @returns Object with all optimization settings
 */
export const getAllOptimizationSettings = () => {
  // Detect device capabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  })();
  const hasWorkers = typeof Worker !== 'undefined';
  const deviceMemory = (navigator as any).deviceMemory as number | undefined;
  
  return {
    detectionInterval: getOptimalDetectionInterval(isMobile, hasWebGL),
    resolutionScale: getOptimalResolutionScale(isMobile, deviceMemory),
    useWebGL: shouldUseWebGL(hasWebGL),
    useWebWorkers: shouldUseWebWorkers(hasWorkers),
    confidenceThreshold: getOptimalConfidenceThreshold(isMobile),
    trajectoryPointCount: getOptimalTrajectoryPointCount(isMobile),
    visualizationDetail: getOptimalVisualizationDetail(isMobile, hasWebGL),
  };
};
