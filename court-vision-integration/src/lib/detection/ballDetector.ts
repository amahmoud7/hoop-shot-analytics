import * as ort from 'onnxruntime-web';
import { BallDetection, ModelConfig, OnnxSession } from './types';

// Default model configuration (adjust path and names as needed)
const DEFAULT_MODEL_CONFIG: ModelConfig = {
  path: '/models/yolov9_basketball_detector.onnx', // Path relative to the public folder
  inputNames: ['images'],
  outputNames: ['output0'],
  inputShape: [1, 3, 640, 640], // Example shape [batch_size, channels, height, width]
};

/**
 * Ball detector class using ONNX runtime for inference.
 */
export class BallDetector {
  private session: OnnxSession | null = null;
  private modelConfig: ModelConfig;
  private isModelLoaded: boolean = false;
  private modelLoading: boolean = false;
  private confidenceThreshold: number = 0.5;
  private iouThreshold: number = 0.45;
  private inputShape: readonly number[];

  constructor(
    modelConfig: Partial<ModelConfig> = {},
    confidenceThreshold: number = 0.5,
    iouThreshold: number = 0.45
  ) {
    this.modelConfig = { ...DEFAULT_MODEL_CONFIG, ...modelConfig };
    this.confidenceThreshold = confidenceThreshold;
    this.iouThreshold = iouThreshold;
    this.inputShape = this.modelConfig.inputShape;
  }

  /**
   * Load the ONNX model.
   */
  public async loadModel(): Promise<void> {
    if (this.isModelLoaded || this.modelLoading) {
      return;
    }

    this.modelLoading = true;
    console.log('Loading ball detection model...');

    try {
      // Configure ONNX runtime
      ort.env.wasm.wasmPaths = {
        'ort-wasm.wasm': '/ort-wasm.wasm',
        'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
        'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
      };
      // Consider enabling SIMD/threading based on browser support for performance
      // await ort.env.wasm.enableSIMD();
      // await ort.env.wasm.enableThreading();

      this.session = await ort.InferenceSession.create(this.modelConfig.path, {
        executionProviders: ['wasm'], // 'webgl' or 'webgpu' could be faster if available
        graphOptimizationLevel: 'all',
      });

      this.isModelLoaded = true;
      console.log('Ball detection model loaded successfully.');
    } catch (error) {
      console.error('Error loading ball detection model:', error);
      this.session = null;
      throw error; // Re-throw error to signal failure
    } finally {
      this.modelLoading = false;
    }
  }

  /**
   * Preprocess the video frame for model input.
   * Resizes, normalizes, and converts to the required tensor format.
   */
  private async preprocess(videoElement: HTMLVideoElement): Promise<ort.Tensor> {
    const [modelWidth, modelHeight] = this.inputShape.slice(2);
    const canvas = document.createElement('canvas');
    canvas.width = modelWidth;
    canvas.height = modelHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Draw video frame onto canvas, resizing it
    ctx.drawImage(videoElement, 0, 0, modelWidth, modelHeight);

    // Get image data
    const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight);
    const { data } = imageData;

    // Convert image data to Float32Array in CHW format and normalize (0-1)
    const float32Data = new Float32Array(modelWidth * modelHeight * 3);
    for (let i = 0; i < modelWidth * modelHeight; i++) {
      const r = data[i * 4 + 0] / 255.0;
      const g = data[i * 4 + 1] / 255.0;
      const b = data[i * 4 + 2] / 255.0;

      float32Data[i] = r;
      float32Data[i + modelWidth * modelHeight] = g;
      float32Data[i + 2 * modelWidth * modelHeight] = b;
    }

    // Create ONNX tensor
    const tensor = new ort.Tensor('float32', float32Data, this.inputShape);
    return tensor;
  }

  /**
   * Postprocess the model output to extract bounding boxes and confidences.
   * This depends heavily on the specific model's output format.
   * Assuming output format [batch_size, num_detections, 6] where 6 = [x_center, y_center, width, height, confidence, class_id]
   */
  private postprocess(outputTensor: ort.Tensor, videoWidth: number, videoHeight: number): BallDetection[] {
    const outputData = outputTensor.data as Float32Array;
    const detections: { box: [number, number, number, number]; score: number }[] = [];
    const [modelWidth, modelHeight] = this.inputShape.slice(2);
    const scaleX = videoWidth / modelWidth;
    const scaleY = videoHeight / modelHeight;

    // Assuming output shape [1, num_detections, 6]
    const numDetections = outputTensor.dims[1];
    const boxSize = 6; // x_center, y_center, width, height, confidence, class_id

    for (let i = 0; i < numDetections; i++) {
      const offset = i * boxSize;
      const confidence = outputData[offset + 4];
      const classId = outputData[offset + 5]; // Assuming basketball is class 0

      // Filter by confidence and class ID (adjust class ID if needed)
      if (confidence >= this.confidenceThreshold && classId === 0) {
        const centerX = outputData[offset + 0] * scaleX;
        const centerY = outputData[offset + 1] * scaleY;
        const width = outputData[offset + 2] * scaleX;
        const height = outputData[offset + 3] * scaleY;

        const x1 = centerX - width / 2;
        const y1 = centerY - height / 2;
        const x2 = centerX + width / 2;
        const y2 = centerY + height / 2;

        detections.push({ box: [x1, y1, x2, y2], score: confidence });
      }
    }

    // Apply Non-Maximum Suppression (NMS)
    const nmsResults = this.applyNMS(detections);

    // Convert NMS results to BallDetection format
    const ballDetections: BallDetection[] = nmsResults.map(det => {
      const [x1, y1, x2, y2] = det.box;
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      const radius = Math.max(x2 - x1, y2 - y1) / 2; // Approximate radius
      return {
        x,
        y,
        radius,
        confidence: det.score,
        timestamp: Date.now(),
      };
    });

    return ballDetections;
  }

  /**
   * Apply Non-Maximum Suppression (NMS) to filter overlapping boxes.
   */
  private applyNMS(detections: { box: [number, number, number, number]; score: number }[]): { box: [number, number, number, number]; score: number }[] {
    if (detections.length === 0) return [];

    // Sort detections by score in descending order
    detections.sort((a, b) => b.score - a.score);

    const results: { box: [number, number, number, number]; score: number }[] = [];
    const selectedIndices = new Set<number>();

    for (let i = 0; i < detections.length; i++) {
      if (selectedIndices.has(i)) continue;

      results.push(detections[i]);
      selectedIndices.add(i);

      const boxA = detections[i].box;
      const areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);

      for (let j = i + 1; j < detections.length; j++) {
        if (selectedIndices.has(j)) continue;

        const boxB = detections[j].box;
        const areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);

        // Calculate intersection
        const x1 = Math.max(boxA[0], boxB[0]);
        const y1 = Math.max(boxA[1], boxB[1]);
        const x2 = Math.min(boxA[2], boxB[2]);
        const y2 = Math.min(boxA[3], boxB[3]);

        const intersectionWidth = Math.max(0, x2 - x1);
        const intersectionHeight = Math.max(0, y2 - y1);
        const intersectionArea = intersectionWidth * intersectionHeight;

        // Calculate IoU (Intersection over Union)
        const unionArea = areaA + areaB - intersectionArea;
        const iou = unionArea > 0 ? intersectionArea / unionArea : 0;

        if (iou >= this.iouThreshold) {
          selectedIndices.add(j);
        }
      }
    }

    return results;
  }

  /**
   * Detect basketball in the current video frame.
   */
  public async detectBall(videoElement: HTMLVideoElement): Promise<BallDetection[]> {
    if (!this.isModelLoaded || !this.session) {
      console.warn('Model not loaded yet. Call loadModel() first.');
      // Attempt to load model if not already loading
      if (!this.modelLoading) {
        await this.loadModel();
      }
      // If still not loaded after attempt, return empty
      if (!this.isModelLoaded || !this.session) {
          return [];
      }
    }

    try {
      // 1. Preprocess the frame
      const inputTensor = await this.preprocess(videoElement);

      // 2. Run inference
      const feeds: Record<string, ort.Tensor> = {};
      feeds[this.modelConfig.inputNames[0]] = inputTensor;

      const results = await this.session.run(feeds);

      // 3. Postprocess the results
      const outputTensor = results[this.modelConfig.outputNames[0]];
      const detections = this.postprocess(
        outputTensor,
        videoElement.videoWidth,
        videoElement.videoHeight
      );

      // Dispose tensors to free memory
      inputTensor.dispose();
      outputTensor.dispose();

      return detections;
    } catch (error) {
      console.error('Error during ball detection inference:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Clean up resources (e.g., dispose ONNX session).
   */
  public dispose(): void {
    if (this.session) {
      // ONNX Runtime Web doesn't have an explicit dispose method for sessions yet.
      // Setting to null helps with garbage collection.
      this.session = null;
    }
    this.isModelLoaded = false;
    console.log('BallDetector disposed.');
  }
}

