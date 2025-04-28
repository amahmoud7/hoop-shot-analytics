import * as ort from 'onnxruntime-web';

// Basic types for detection and calibration
export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BallDetection extends Point {
  radius: number;
  confidence: number;
  timestamp: number;
}

export interface CalibrationPoint extends Point {
  label: string; // e.g., "Top Left Corner", "Free Throw Line Center"
  courtX: number; // Corresponding X coordinate on the standardized court
  courtY: number; // Corresponding Y coordinate on the standardized court
}

export interface CourtDimensions {
  width: number; // e.g., in feet or meters
  height: number;
  threePointRadius: number;
  keyWidth: number;
  keyHeight: number;
  // Add other relevant court markings if needed
}

export interface CourtCalibration {
  points: CalibrationPoint[];
  homographyMatrix: number[][] | null;
  inverseHomographyMatrix?: number[][] | null; // Optional: Store inverse for efficiency
  courtDimensions: CourtDimensions;
  calibrationTimestamp: number;
}

// Types for shot tracking
export interface TrajectoryPoint extends Point {
  timestamp: number;
}

export interface ShotTrajectory {
  points: TrajectoryPoint[];
  startTime: number;
  endTime: number;
  peakHeight: number; // Max height in screen coordinates (lower y value)
  launchAngle: number; // Angle in degrees
  isMade: boolean;
  isThreePoint: boolean;
  courtStartX?: number; // Starting X on court
  courtStartY?: number; // Starting Y on court
  courtEndX?: number; // Ending X on court
  courtEndY?: number; // Ending Y on court
}

export interface Shot {
  id: string;
  x: number; // Starting screen X
  y: number; // Starting screen Y
  courtX?: number; // Starting court X
  courtY?: number; // Starting court Y
  isThreePoint: boolean;
  isMade: boolean;
  timestamp: number;
  trajectory?: ShotTrajectory; // Optional: link to full trajectory data
}

// Types for ONNX Model Handling
export interface ModelConfig {
  path: string;
  inputNames: string[];
  outputNames: string[];
  inputShape: readonly number[]; // e.g., [1, 3, 640, 640]
}

export type OnnxSession = ort.InferenceSession;

