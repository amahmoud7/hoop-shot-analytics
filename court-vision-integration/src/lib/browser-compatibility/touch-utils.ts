
/**
 * Touch event normalization and utilities
 */

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
