import { CalibrationPoint, CourtDimensions, CourtCalibration, Point } from "./types";
import { solveLinearSystem, invert3x3Matrix } from "../utils/matrix";

// Default NBA court dimensions in feet
const DEFAULT_COURT_DIMENSIONS: CourtDimensions = {
  width: 94,
  height: 50,
  threePointRadius: 23.75,
  keyWidth: 16,
  keyHeight: 19,
};

/**
 * Court calibration utility using Direct Linear Transform (DLT)
 * for robust homography estimation.
 */
export class CourtCalibrator {
  private calibrationPoints: CalibrationPoint[] = [];
  private homographyMatrix: number[][] | null = null;
  private inverseHomographyMatrix: number[][] | null = null;
  private courtDimensions: CourtDimensions;
  private isCalibrated: boolean = false;

  constructor(courtDimensions?: Partial<CourtDimensions>) {
    this.courtDimensions = { ...DEFAULT_COURT_DIMENSIONS, ...courtDimensions };
  }

  /**
   * Add a calibration point (screen coords + court coords).
   */
  public addCalibrationPoint(point: CalibrationPoint): void {
    // Avoid duplicate labels if necessary, or allow updates
    const existingIndex = this.calibrationPoints.findIndex(p => p.label === point.label);
    if (existingIndex !== -1) {
        this.calibrationPoints[existingIndex] = point;
    } else {
        this.calibrationPoints.push(point);
    }
    this.resetCalibration();
  }

  /**
   * Set all calibration points at once.
   */
  public setCalibrationPoints(points: CalibrationPoint[]): void {
    this.calibrationPoints = [...points];
    this.resetCalibration();
  }

  /**
   * Get all current calibration points.
   */
  public getCalibrationPoints(): CalibrationPoint[] {
    return [...this.calibrationPoints];
  }

  /**
   * Clear all calibration points and reset calibration status.
   */
  public clearCalibrationPoints(): void {
    this.calibrationPoints = [];
    this.resetCalibration();
  }

  /**
   * Check if enough points are available for DLT (at least 4).
   */
  public hasEnoughPoints(): boolean {
    return this.calibrationPoints.length >= 4;
  }

  private resetCalibration(): void {
    this.homographyMatrix = null;
    this.inverseHomographyMatrix = null;
    this.isCalibrated = false;
  }

  /**
   * Compute the homography matrix using the Direct Linear Transform (DLT) algorithm.
   * Requires at least 4 non-collinear point correspondences.
   */
  public computeHomography(): boolean {
    if (!this.hasEnoughPoints()) {
      console.error("Need at least 4 calibration points to compute homography.");
      return false;
    }

    // Construct the matrix A for the DLT algorithm (Ah = 0)
    // Each point correspondence gives 2 rows in A
    const numPoints = this.calibrationPoints.length;
    const A: number[][] = [];
    for (const p of this.calibrationPoints) {
      const { x: sx, y: sy, courtX: cx, courtY: cy } = p;
      A.push([-sx, -sy, -1, 0, 0, 0, sx * cx, sy * cx, cx]);
      A.push([0, 0, 0, -sx, -sy, -1, sx * cy, sy * cy, cy]);
    }

    // Solve Ah = 0 using Singular Value Decomposition (SVD)
    // Since SVD is complex to implement from scratch in JS, we can approximate
    // by solving the related system A^T * A * h = 0. The solution h is the
    // eigenvector corresponding to the smallest eigenvalue of A^T * A.

    // For simplicity here, we will formulate as Ax = b where h8 = 1 (if h8 != 0)
    // This is less robust than SVD but easier to implement with solveLinearSystem.
    // We create an 8x8 system by setting h33 (or h[8]) to 1.
    if (numPoints === 4) {
        // Use the exact 8x8 system if exactly 4 points
        const A_8x8: number[][] = [];
        const b_8x1: number[] = [];
        for (const p of this.calibrationPoints) {
            const { x: sx, y: sy, courtX: cx, courtY: cy } = p;
            A_8x8.push([-sx, -sy, -1, 0, 0, 0, sx * cx, sy * cx]);
            A_8x8.push([0, 0, 0, -sx, -sy, -1, sx * cy, sy * cy]);
            b_8x1.push(-cx);
            b_8x1.push(-cy);
        }

        const h_8x1 = solveLinearSystem(A_8x8, b_8x1);

        if (!h_8x1) {
            console.error("Failed to solve linear system for homography (potentially degenerate points).");
            this.resetCalibration();
            return false;
        }

        // Reshape h into 3x3 matrix H
        this.homographyMatrix = [
            [h_8x1[0], h_8x1[1], h_8x1[2]],
            [h_8x1[3], h_8x1[4], h_8x1[5]],
            [h_8x1[6], h_8x1[7], 1.0] // Set h33 = 1
        ];

    } else {
        // If more than 4 points, use a least-squares approach (pseudo-inverse)
        // This is more complex. For now, we stick to the 4-point method or warn.
        console.warn("Homography calculation currently implemented for exactly 4 points. Using first 4.");
        // Fallback to using only the first 4 points
        const tempCalibrator = new CourtCalibrator(this.courtDimensions);
        tempCalibrator.setCalibrationPoints(this.calibrationPoints.slice(0, 4));
        const success = tempCalibrator.computeHomography();
        if (success) {
            this.homographyMatrix = tempCalibrator.getHomographyMatrix();
        } else {
             this.resetCalibration();
             return false;
        }
    }

    // Compute and store the inverse matrix for court-to-screen transformations
    this.inverseHomographyMatrix = invert3x3Matrix(this.homographyMatrix);
    if (!this.inverseHomographyMatrix) {
        console.error("Computed homography matrix is singular, cannot invert.");
        this.resetCalibration();
        return false;
    }

    this.isCalibrated = true;
    console.log("Homography computed successfully.");
    return true;
  }

  /**
   * Get the computed homography matrix (screen to court).
   */
  public getHomographyMatrix(): number[][] | null {
    return this.homographyMatrix ? [...this.homographyMatrix.map(row => [...row])] : null;
  }

  /**
   * Get the computed inverse homography matrix (court to screen).
   */
    public getInverseHomographyMatrix(): number[][] | null {
        return this.inverseHomographyMatrix ? [...this.inverseHomographyMatrix.map(row => [...row])] : null;
    }

  /**
   * Transform a point from screen coordinates (pixels) to court coordinates (e.g., feet).
   */
  public screenToCourtCoordinates(sx: number, sy: number): Point | null {
    if (!this.isCalibrated && !this.computeHomography()) {
      console.warn("Calibration not computed or failed. Cannot transform coordinates.");
      return null;
    }
    if (!this.homographyMatrix) return null;

    const H = this.homographyMatrix;
    const denominator = H[2][0] * sx + H[2][1] * sy + H[2][2];

    if (Math.abs(denominator) < 1e-10) {
      console.warn("Denominator close to zero during screenToCourt transformation.");
      return null; // Avoid division by zero
    }

    const courtX = (H[0][0] * sx + H[0][1] * sy + H[0][2]) / denominator;
    const courtY = (H[1][0] * sx + H[1][1] * sy + H[1][2]) / denominator;

    return { x: courtX, y: courtY };
  }

  /**
   * Transform a point from court coordinates (e.g., feet) to screen coordinates (pixels).
   */
  public courtToScreenCoordinates(courtX: number, courtY: number): Point | null {
    if (!this.isCalibrated && !this.computeHomography()) {
        console.warn("Calibration not computed or failed. Cannot transform coordinates.");
        return null;
    }
    if (!this.inverseHomographyMatrix) return null;

    const invH = this.inverseHomographyMatrix;
    const denominator = invH[2][0] * courtX + invH[2][1] * courtY + invH[2][2];

    if (Math.abs(denominator) < 1e-10) {
      console.warn("Denominator close to zero during courtToScreen transformation.");
      return null; // Avoid division by zero
    }

    const sx = (invH[0][0] * courtX + invH[0][1] * courtY + invH[0][2]) / denominator;
    const sy = (invH[1][0] * courtX + invH[1][1] * courtY + invH[1][2]) / denominator;

    return { x: sx, y: sy };
  }

  /**
   * Check if a point on the court (in court coordinates) is beyond the three-point line.
   * Assumes the basket is at a known court coordinate (e.g., center of the baseline or hoop center).
   * This needs refinement based on the chosen court coordinate system origin.
   * Let's assume origin (0,0) is under the basket for simplicity here.
   */
  public isThreePointShot(courtX: number, courtY: number): boolean {
    // Simple distance check from origin (0,0) assumed to be under the basket
    // This might need adjustment based on actual court origin definition
    const distanceFromBasket = Math.sqrt(courtX * courtX + courtY * courtY);

    // TODO: Account for the straight parts of the 3-point line near the baseline if needed.
    // For now, just using the radius.
    return distanceFromBasket > this.courtDimensions.threePointRadius;
  }

  /**
   * Get the current calibration state.
   */
  public getCalibration(): CourtCalibration | null {
    if (!this.isCalibrated) return null;
    return {
      points: [...this.calibrationPoints],
      homographyMatrix: this.getHomographyMatrix(),
      inverseHomographyMatrix: this.getInverseHomographyMatrix(),
      courtDimensions: { ...this.courtDimensions },
      calibrationTimestamp: Date.now(), // Or store the actual computation time
    };
  }

  /**
   * Load a previously saved calibration state.
   */
  public loadCalibration(calibration: CourtCalibration): boolean {
    try {
      if (calibration.points.length < 4 || !calibration.homographyMatrix) {
          throw new Error("Invalid calibration data provided.");
      }
      this.calibrationPoints = [...calibration.points];
      this.homographyMatrix = calibration.homographyMatrix.map(row => [...row]);
      // Recompute or load inverse matrix
      this.inverseHomographyMatrix = calibration.inverseHomographyMatrix
        ? calibration.inverseHomographyMatrix.map(row => [...row])
        : invert3x3Matrix(this.homographyMatrix);

      if (!this.inverseHomographyMatrix) {
          throw new Error("Loaded homography matrix is singular.");
      }

      this.courtDimensions = { ...DEFAULT_COURT_DIMENSIONS, ...calibration.courtDimensions };
      this.isCalibrated = true;
      console.log("Calibration loaded successfully.");
      return true;
    } catch (error) {
      console.error("Error loading calibration:", error);
      this.resetCalibration();
      return false;
    }
  }

  /**
   * Returns whether the court is currently calibrated.
   */
  public getIsCalibrated(): boolean {
    return this.isCalibrated;
  }
}

