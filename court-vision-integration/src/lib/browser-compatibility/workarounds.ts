
/**
 * Browser-specific workarounds and fixes
 */
import { deviceDetection } from './device-detection';

// Browser-specific workarounds
export const applyBrowserWorkarounds = () => {
  // iOS Safari specific fixes
  const isIOS = deviceDetection.isIOS();
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
  const isSafari = deviceDetection.isSafari();
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
