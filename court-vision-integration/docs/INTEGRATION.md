# CourtVision Integration Guide

This guide explains how to integrate the CourtVision AI-powered basketball tracking functionality into the Hoop Shot Analytics application.

## Overview

The integration package provides the following core components:

1. **Ball Detection**: Real-time basketball detection using YOLO-v9/RTMDet with ONNX runtime
2. **Court Calibration**: Robust homography transformation for mapping between screen and court coordinates
3. **Shot Tracking**: Sophisticated trajectory analysis for shot detection and classification
4. **Analytics Generation**: Statistics calculation and heatmap generation from shot data
5. **Cross-Browser Compatibility**: Feature detection and fallbacks for various browsers and devices

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- A modern web browser with WebRTC and WebAssembly support

## Installation

1. **Install the required dependencies**:

```bash
npm install onnxruntime-web
```

2. **Copy the integration files**:

Copy the contents of the `src/lib` directory from this package to your project's `src/lib` directory. This includes:

- `detection/`: Ball detection, court calibration, and shot tracking
- `analytics/`: Shot statistics and heatmap generation
- `utils/`: Matrix operations and other utilities
- `browser-compatibility.tsx`: Cross-browser compatibility layer

3. **Add the ONNX model file**:

Copy the `models/yolov9_basketball_detector.onnx` file to your project's `public` directory. This ensures the model is accessible at runtime.

4. **Configure ONNX runtime**:

Copy the ONNX runtime WebAssembly files to your project's `public` directory:
- `ort-wasm.wasm`
- `ort-wasm-simd.wasm`
- `ort-wasm-threaded.wasm`

These files are available in the `node_modules/onnxruntime-web/dist` directory after installing the dependency.

## Integration Steps

### 1. Ball Detection Integration

Replace the existing simulated ball detection with the AI-powered implementation:

```tsx
// In your component file (e.g., CameraFeed.tsx)
import { useBallDetection } from '../lib/detection/useBallDetection';

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    detections, 
    isModelLoaded, 
    isDetecting,
    startDetection,
    stopDetection 
  } = useBallDetection({
    videoElementRef: videoRef,
    canvasElementRef: canvasRef,
    confidenceThreshold: 0.5,
    detectionIntervalMs: 100,
    autoStart: true
  });
  
  // Pass detections to shot tracking
  useEffect(() => {
    if (detections.length > 0) {
      // Use the first detection (highest confidence)
      processBallDetection(detections[0]);
    } else {
      processBallDetection(null);
    }
  }, [detections, processBallDetection]);
  
  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} />
      {/* Controls for starting/stopping detection */}
    </div>
  );
};
```

### 2. Court Calibration Integration

Replace the existing court calibration with the homography-based implementation:

```tsx
// In your calibration component (e.g., Calibration.tsx)
import { useCourtCalibration } from '../lib/detection/useCourtCalibration';
import { CalibrationPoint } from '../lib/detection/types';

const CalibrationComponent = () => {
  const { 
    calibrationPoints,
    isCalibrated,
    calibrationError,
    addCalibrationPoint,
    clearCalibrationPoints,
    computeCalibration
  } = useCourtCalibration({
    persistCalibration: true,
    storageKey: 'basketball-court-calibration'
  });
  
  const handleTap = (event) => {
    // Get tap coordinates
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create calibration point
    const point: CalibrationPoint = {
      x,
      y,
      label: `Point ${calibrationPoints.length + 1}`,
      courtX: 0, // Set appropriate court coordinates based on your UI
      courtY: 0
    };
    
    addCalibrationPoint(point);
  };
  
  return (
    <div>
      <div onClick={handleTap} style={{ position: 'relative' }}>
        {/* Court image or video frame */}
        <img src="/court-template.png" alt="Basketball Court" />
        
        {/* Render calibration points */}
        {calibrationPoints.map((point, index) => (
          <div 
            key={index}
            style={{
              position: 'absolute',
              left: point.x - 5,
              top: point.y - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'red'
            }}
          />
        ))}
      </div>
      
      <button onClick={clearCalibrationPoints}>Clear Points</button>
      <button 
        onClick={computeCalibration}
        disabled={calibrationPoints.length < 4}
      >
        Calibrate Court
      </button>
      
      {calibrationError && <p>{calibrationError}</p>}
      {isCalibrated && <p>Court calibration successful!</p>}
    </div>
  );
};
```

### 3. Shot Tracking Integration

Replace the existing shot tracking with the trajectory analysis implementation:

```tsx
// In your tracking component (e.g., Tracking.tsx)
import { useShotTracking } from '../lib/detection/useShotTracking';

const TrackingComponent = () => {
  const { 
    isTracking,
    trajectoryPoints,
    shots,
    score,
    shotAnimation,
    processBallDetection,
    calculateStats,
    resetTracking
  } = useShotTracking({
    minTrajectoryPoints: 5,
    shotDetectionCooldown: 2000,
    useCalibration: true
  });
  
  // Set rim position for better shot detection
  useEffect(() => {
    // Set rim position based on your UI or calibration
    setRimPosition({ x: 320, y: 180 });
  }, []);
  
  return (
    <div>
      {/* Render trajectory and shots */}
      <div>
        {trajectoryPoints.map((point, index) => (
          <div 
            key={index}
            style={{
              position: 'absolute',
              left: point.x - 2,
              top: point.y - 2,
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'yellow'
            }}
          />
        ))}
        
        {shotAnimation.visible && (
          <div 
            style={{
              position: 'absolute',
              left: shotAnimation.x - 15,
              top: shotAnimation.y - 15,
              animation: 'fadeOut 1.5s',
              fontSize: '24px'
            }}
          >
            🏀
          </div>
        )}
      </div>
      
      {/* Display score */}
      <div>
        <h3>Score: {score.team1}</h3>
      </div>
      
      <button onClick={resetTracking}>Reset</button>
    </div>
  );
};
```

### 4. Analytics Integration

Integrate the analytics generation for statistics and heatmaps:

```tsx
// In your analytics component (e.g., Analytics.tsx)
import { useAnalytics } from '../lib/analytics/useAnalytics';

const AnalyticsComponent = ({ shots }) => {
  const { 
    stats,
    heatmap,
    shotChart,
    generateAnalytics,
    exportAnalytics
  } = useAnalytics({
    shots,
    autoUpdate: true,
    heatmapGridSize: 10
  });
  
  const handleExport = () => {
    const analyticsJson = exportAnalytics();
    if (analyticsJson) {
      // Download or save analytics data
      const blob = new Blob([analyticsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'basketball-analytics.json';
      a.click();
    }
  };
  
  return (
    <div>
      {stats && (
        <div>
          <h3>Shot Statistics</h3>
          <p>Total Shots: {stats.totalShots}</p>
          <p>Made: {stats.madeShots} ({stats.shotPercentage.toFixed(1)}%)</p>
          <p>2PT: {stats.twoPointMade}/{stats.twoPointAttempts} ({stats.twoPointPercentage.toFixed(1)}%)</p>
          <p>3PT: {stats.threePointMade}/{stats.threePointAttempts} ({stats.threePointPercentage.toFixed(1)}%)</p>
          <p>Points: {stats.pointsScored}</p>
        </div>
      )}
      
      {heatmap && (
        <div>
          <h3>Shot Heatmap</h3>
          {/* Render heatmap visualization using your preferred library */}
          {/* Example: Use a canvas or a library like heatmap.js */}
        </div>
      )}
      
      <button onClick={handleExport}>Export Analytics</button>
    </div>
  );
};
```

### 5. Cross-Browser Compatibility Integration

Ensure your application works across different browsers and devices:

```tsx
// In your main component or app initialization
import { 
  browserCapabilities, 
  getCameraStream, 
  getOptimalPerformanceSettings,
  applyBrowserWorkarounds 
} from '../lib/browser-compatibility';

const App = () => {
  const [hasRequiredSupport, setHasRequiredSupport] = useState(true);
  const [performanceSettings, setPerformanceSettings] = useState(null);
  
  useEffect(() => {
    // Apply browser-specific workarounds
    applyBrowserWorkarounds();
    
    // Check if browser supports required features
    const supported = browserCapabilities.hasRequiredSupport();
    setHasRequiredSupport(supported);
    
    // Get optimal performance settings based on device
    const settings = getOptimalPerformanceSettings();
    setPerformanceSettings(settings);
  }, []);
  
  // Initialize camera with cross-browser support
  const initializeCamera = async (videoElement) => {
    const stream = await getCameraStream({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    if (stream && videoElement) {
      videoElement.srcObject = stream;
    }
  };
  
  if (!hasRequiredSupport) {
    return (
      <div>
        <h2>Browser Not Supported</h2>
        <p>Your browser doesn't support the required features for basketball tracking.</p>
        <p>Please use a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Your app components */}
    </div>
  );
};
```

## Troubleshooting

### Model Loading Issues

If the ball detection model fails to load:

1. Ensure the ONNX model file is correctly placed in the public directory
2. Check browser console for specific error messages
3. Verify that the ONNX runtime WebAssembly files are accessible
4. Try using a smaller model if performance is an issue on mobile devices

### Camera Access Issues

If camera access fails:

1. Ensure the application is running on HTTPS (required for camera access)
2. Check if the user has granted camera permissions
3. Try different constraints (resolution, facing mode) using the compatibility layer

### Calibration Issues

If court calibration fails:

1. Ensure at least 4 non-collinear points are provided
2. Check that the points are accurately placed on recognizable court features
3. Try recalibrating with more evenly distributed points

### Performance Issues

If the application runs slowly:

1. Use the performance settings from `getOptimalPerformanceSettings()`
2. Reduce detection frequency on lower-end devices
3. Scale down video resolution for processing
4. Consider using the optimized components for mobile devices

## Advanced Configuration

### Custom Model Integration

To use a custom basketball detection model:

1. Convert your model to ONNX format
2. Place the model file in the public directory
3. Update the model configuration in the `useBallDetection` hook:

```tsx
const { detections } = useBallDetection({
  videoElementRef: videoRef,
  modelConfig: {
    path: '/your-custom-model.onnx',
    inputNames: ['your_input_name'],
    outputNames: ['your_output_name'],
    inputShape: [1, 3, 640, 640] // Adjust to your model's input shape
  }
});
```

### Custom Court Dimensions

To use custom court dimensions:

```tsx
const { isCalibrated } = useCourtCalibration({
  courtDimensions: {
    width: 94, // NBA court width in feet
    height: 50, // NBA court height in feet
    threePointRadius: 23.75, // NBA three-point line radius in feet
    keyWidth: 16, // NBA key width in feet
    keyHeight: 19, // NBA key height in feet
  }
});
```

## Support

For additional support or questions about the integration, please refer to the documentation or contact the CourtVision team.
