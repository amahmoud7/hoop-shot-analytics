
/**
 * Device and browser detection utilities
 */

// Device type detection
export const deviceDetection = {
  // Check if the device is a mobile device
  isMobileDevice: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device is iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  },

  // Check if browser is Safari
  isSafari: () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  // Check if the device has touch support
  hasTouchSupport: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};
