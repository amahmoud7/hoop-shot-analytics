# Integration Requirements for CourtVision Logic into Hoop Shot Analytics UI

This document outlines the requirements for integrating the core CourtVision AI logic (ball detection, court calibration, shot tracking) into the existing Hoop Shot Analytics React application structure.

The goal is to create a set of modular, "plug-and-play" components that replace the current simulated logic in `/home/ubuntu/hoop-shot-analytics/src/lib/detection` while minimizing changes required in the UI components and hooks.

## 1. Ball Detection (`src/lib/detection/ballDetector.ts` & `useBallDetection.ts`)

*   **Replace Simulation:** The existing `BallDetector` class simulates detection. This needs to be replaced with the actual implementation using YOLO-v9/RTMDet via ONNX runtime (e.g., using `onnxruntime-web`).
*   **Model Loading:** Implement robust loading of the ONNX model file (which will need to be included in the package or hosted). Handle potential loading errors gracefully.
*   **Inference:** Perform inference on video frames captured from `CameraFeed.tsx`.
*   **Output:** The `detectBall` method (or equivalent) should return `BallDetection` objects matching the existing `types.ts` definition, including `x`, `y`, `radius`, `confidence`, and `timestamp`.
*   **Hook Compatibility:** Ensure the `useBallDetection` hook can utilize the new `BallDetector` class without significant changes to its interface.
*   **Performance:** Optimize inference frequency and model usage for web browser performance.

## 2. Court Calibration (`src/lib/detection/courtCalibrator.ts` & `useCourtCalibration.ts`)

*   **Replace Simulation:** The current `computeHomography` uses a simplified approach. Replace this with a robust homography calculation method (e.g., using Direct Linear Transform algorithm). Consider using a library like `opencv.js` if feasible or a pure JS implementation.
*   **Input:** The `CourtCalibrator` should accept calibration points (screen coordinates mapped to known court locations) provided via the `Calibration.tsx` page.
*   **Methods:** Retain the existing methods like `addCalibrationPoint`, `setCalibrationPoints`, `screenToCourtCoordinates`, `courtToScreenCoordinates`, `isThreePointShot`.
*   **Coordinate Systems:** Ensure accurate mapping between screen pixels and standardized court coordinates (e.g., feet or meters).
*   **Persistence:** The `useCourtCalibration` hook should handle saving/loading calibration data (likely via `useDataStorage`).
*   **Advanced Calibration (Optional but Recommended):** Integrate the Segment-Anything + Hough transform method from CourtVision as an alternative calibration option if feasible in the browser.

## 3. Shot Tracking (`src/lib/detection/useShotTracking.ts`)

*   **Refine Trajectory Analysis:** Replace the simplified `analyzeTrajectory` logic with the more sophisticated approach from CourtVision. This should involve:
    *   Analyzing sequences of `BallDetection` points.
    *   Identifying parabolic arcs characteristic of shots.
    *   Using the `CourtCalibrator` to map trajectory points to court coordinates.
*   **Make/Miss Detection:** Implement logic to determine if a shot is made or missed. This might involve detecting the ball's interaction with a defined hoop area (derived from calibration) or analyzing the trajectory's end state.
*   **2pt/3pt Classification:** Utilize the `CourtCalibrator.isThreePointShot` method based on the shot's origin point in court coordinates.
*   **Output:** The hook should continue to provide `shots` (matching `Shot` type in `types.ts`), `shotTrajectories`, `score`, etc.
*   **Interface:** Maintain the existing hook's interface (`processBallDetection`, `calculateStats`, `resetTracking`) as much as possible.

## 4. Packaging and Integration

*   **Modular Structure:** Keep the logic within the `src/lib/detection` directory structure.
*   **Dependencies:** Clearly list any new dependencies required (e.g., `onnxruntime-web`, potentially `opencv.js`).
*   **Model Files:** Include the necessary ONNX model file(s) or provide instructions for hosting them.
*   **Documentation (`INTEGRATION.md`):** Provide clear, step-by-step instructions on:
    *   Replacing the existing files in `src/lib/detection`.
    *   Installing new dependencies.
    *   Placing/hosting the ONNX model.
    *   Any minor adjustments needed in UI components or hooks (aim for zero adjustments if possible).
*   **Deliverable:** A zip archive containing the modified `src/lib/detection` directory, the `INTEGRATION.md` file, and any necessary model files.
