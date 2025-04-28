
# CourtVision AI Integration

This document describes how the CourtVision AI basketball tracking capabilities have been integrated into the Hoop Shot Analytics application.

## Integration Components

The following components have been integrated:

1. **Ball Detection**: Real-time basketball detection using the CourtVision AI model
2. **Court Calibration**: Maps between screen coordinates and court coordinates
3. **Shot Tracking**: Detects and analyzes basketball shots in real-time
4. **Analytics Generation**: Generates statistics and visualizations from shot data
5. **Data Storage**: Saves and loads shot data and analytics

## Key Files

- `src/lib/courtVision.ts`: Main integration module that re-exports CourtVision components
- `src/lib/integrationUtils.ts`: Utilities for converting between data formats
- `src/pages/Tracking.tsx`: Updated to use the CourtVision shot tracking
- `src/pages/Analytics.tsx`: Updated to use the CourtVision analytics

## Usage

### Shot Tracking

The `useShotTracking` hook from CourtVision is now used in the Tracking page:

```tsx
const { 
  shots, 
  score, 
  shotAnimation, 
  processBallDetection, 
  calculateStats 
} = useShotTracking({
  onShotDetected: (shot) => {
    // Show toast notification when a shot is detected
  }
});
```

When a ball is detected in the camera feed, call `processBallDetection(detection)` to analyze it.

### Analytics

The `useAnalytics` hook from CourtVision provides statistics and visualizations:

```tsx
const { 
  generateStats, 
  generateShotChart, 
  generateHeatmap 
} = useAnalytics({
  shots: gameData?.shots
});
```

### Data Storage

The `useDataStorage` hook enables saving and loading game data:

```tsx
const { 
  savedGames, 
  loadSavedGame, 
  saveGameWithAnalytics 
} = useDataStorage();
```

## Model Files

The CourtVision ONNX model file (`yolov9_basketball_detector.onnx`) should be placed in the `public/models/` directory.

## Additional Resources

For more information on the CourtVision functionality, refer to the documentation in the `court-vision-integration/docs/` directory.
