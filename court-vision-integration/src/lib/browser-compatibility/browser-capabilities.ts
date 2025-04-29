
/**
 * Browser capabilities detection
 * Provides feature detection utilities for various browser features
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
