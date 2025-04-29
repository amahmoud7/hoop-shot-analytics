
/**
 * DOM-related utilities for cross-browser compatibility
 */

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
