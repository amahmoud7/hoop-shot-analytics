
/**
 * Cross-browser compatibility layer for basketball tracking functionality
 * Provides fallbacks and polyfills for various browser environments
 */

// Feature detection utilities
export const browserCapabilities = {
  // Check if WebRTC is supported (for camera access)
  hasWebRTC: () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // Check if WebGL is supported (for rendering and potentially WebGL-accelerated inference)
  hasWebGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },

  // Check if Web Workers are supported (for offloading computation)
  hasWebWorkers: () => {
    return !!window.Worker;
  },

  // Check if SharedArrayBuffer is supported (for multi-threaded WASM)
  hasSharedArrayBuffer: () => {
    return typeof SharedArrayBuffer !== 'undefined';
  },

  // Check if WASM is supported (for ONNX runtime)
  hasWasm: () => {
    try {
      return typeof WebAssembly === 'object' && 
             typeof WebAssembly.instantiate === 'function';
    } catch (e) {
      return false;
    }
  },

  // Check if the browser supports SIMD instructions (for optimized WASM)
  hasWasmSimd: async () => {
    if (!browserCapabilities.hasWasm()) return false;
    
    try {
      const bytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60,
        0x00, 0x01, 0x7b, 0x03, 0x02, 0x01, 0x00, 0x07, 0x08, 0x01, 0x04, 0x74,
        0x65, 0x73, 0x74, 0x00, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00, 0xfd, 0x0c,
        0x00, 0x00, 0x00, 0x00, 0x0b
      ]);
      
      const module = await WebAssembly.instantiate(bytes);
      return true;
    } catch (e) {
      return false;
    }
  },

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
  },

  // Check if the browser supports the Canvas API (required for image processing)
  hasCanvasSupport: () => {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  },

  // Check if the browser supports the required APIs for our application
  hasRequiredSupport: () => {
    return (
      browserCapabilities.hasWebRTC() &&
      browserCapabilities.hasCanvasSupport() &&
      browserCapabilities.hasWasm()
    );
  }
};

// Camera access with fallbacks
export const getCameraStream = async (constraints: MediaStreamConstraints = { 
  video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
}): Promise<MediaStream | null> => {
  if (!browserCapabilities.hasWebRTC()) {
    console.error('WebRTC is not supported in this browser');
    return null;
  }

  // Special handling for iOS Safari
  const isIOS = browserCapabilities.isIOS();
  
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

// Touch event normalization
export const normalizeTouchEvent = (event: TouchEvent | MouseEvent): { x: number, y: number } => {
  if ('touches' in event) {
    // Touch event
    if (event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
    // Handle touchend which doesn't have touches
    if ('changedTouches' in event && event.changedTouches.length > 0) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      };
    }
    return { x: 0, y: 0 };
  } else {
    // Mouse event
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
};

// Performance optimization based on device capabilities
export const getOptimalPerformanceSettings = () => {
  const isMobile = browserCapabilities.isMobileDevice();
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

// Fallback rendering when WebGL is not available
export const createFallbackRenderer = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }
  
  return {
    // Simple circle renderer for ball visualization
    drawBall: (x: number, y: number, radius: number, color: string = 'orange') => {
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    
    // Simple line renderer for trajectory visualization
    drawTrajectory: (points: Array<{x: number, y: number}>, color: string = 'red') => {
      if (!ctx || points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    
    // Clear the canvas
    clear: () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
};

// Browser-specific workarounds
export const applyBrowserWorkarounds = () => {
  // iOS Safari specific fixes
  const isIOS = browserCapabilities.isIOS();
  if (isIOS) {
    console.log("Applying iOS-specific workarounds");
    
    // Fix for iOS Safari video playback issues
    document.addEventListener('touchstart', () => {
      console.log("First touch detected, enabling media on iOS");
      // This empty handler enables media playback on first touch
      
      // Find all video elements and try to play them
      document.querySelectorAll('video').forEach(video => {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log("Auto-play still not working after touch:", err);
              // This is expected - iOS still requires user gesture directly on video
            });
          }
        }
      });
    }, { once: false });
    
    // Add playsinline to all videos created dynamically
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(document, tagName);
      if (tagName.toLowerCase() === 'video') {
        (element as HTMLVideoElement).setAttribute('playsinline', '');
        (element as HTMLVideoElement).setAttribute('webkit-playsinline', '');
        (element as HTMLVideoElement).muted = true;
      }
      return element;
    } as typeof document.createElement;
  }
  
  // Safari autoplay fix
  const isSafari = browserCapabilities.isSafari();
  if (isSafari) {
    console.log("Applying Safari-specific workarounds");
    
    // Add playsinline attribute to all video elements
    document.querySelectorAll('video').forEach(video => {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.muted = true;
    });
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
