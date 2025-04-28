// Placeholder for matrix math utilities
// In a real implementation, consider using a library like math.js or implementing robust matrix operations

/**
 * Multiplies two matrices.
 */
function matrixMultiply(A: number[][], B: number[][]): number[][] | null {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    console.error("Matrix dimensions incompatible for multiplication");
    return null;
  }

  const C: number[][] = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return C;
}

/**
 * Inverts a 3x3 matrix using Cramer's rule / adjoint method.
 * Returns null if the matrix is singular (determinant is zero).
 */
function invert3x3Matrix(H: number[][]): number[][] | null {
  if (H.length !== 3 || H[0].length !== 3 || H[1].length !== 3 || H[2].length !== 3) {
      console.error("Matrix must be 3x3 for inversion");
      return null;
  }

  const [h11, h12, h13] = H[0];
  const [h21, h22, h23] = H[1];
  const [h31, h32, h33] = H[2];

  const det = h11 * (h22 * h33 - h23 * h32) -
              h12 * (h21 * h33 - h23 * h31) +
              h13 * (h21 * h32 - h22 * h31);

  if (Math.abs(det) < 1e-10) { // Use a small epsilon for floating point comparison
    console.warn("Matrix is singular, cannot invert.");
    return null;
  }

  const invDet = 1.0 / det;

  const invH: number[][] = [
    [
      invDet * (h22 * h33 - h23 * h32),
      invDet * (h13 * h32 - h12 * h33),
      invDet * (h12 * h23 - h13 * h22)
    ],
    [
      invDet * (h23 * h31 - h21 * h33),
      invDet * (h11 * h33 - h13 * h31),
      invDet * (h13 * h21 - h11 * h23)
    ],
    [
      invDet * (h21 * h32 - h22 * h31),
      invDet * (h12 * h31 - h11 * h32),
      invDet * (h11 * h22 - h12 * h21)
    ]
  ];

  return invH;
}

/**
 * Solves a system of linear equations Ax = b using Gaussian elimination.
 * This is needed for the DLT algorithm.
 * A is an NxN matrix, b is an Nx1 vector.
 * Returns the solution vector x or null if no unique solution exists.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
    const n = A.length;
    if (n === 0 || A[0].length !== n || b.length !== n) {
        console.error("Invalid input for solveLinearSystem");
        return null;
    }

    // Create augmented matrix
    const augMatrix: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let pivot = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[pivot][i])) {
                pivot = j;
            }
        }
        [augMatrix[i], augMatrix[pivot]] = [augMatrix[pivot], augMatrix[i]]; // Swap rows

        // Check for singularity
        if (Math.abs(augMatrix[i][i]) < 1e-10) {
            console.warn("System may be singular or ill-conditioned.");
            // Depending on the context, you might return null or continue carefully
            // For homography, this usually indicates degenerate point configurations
            return null; 
        }

        // Normalize pivot row
        const pivotVal = augMatrix[i][i];
        for (let j = i; j <= n; j++) {
            augMatrix[i][j] /= pivotVal;
        }

        // Eliminate other rows
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const factor = augMatrix[j][i];
                for (let k = i; k <= n; k++) {
                    augMatrix[j][k] -= factor * augMatrix[i][k];
                }
            }
        }
    }

    // Back substitution (already done by Gauss-Jordan elimination above)
    const x: number[] = augMatrix.map(row => row[n]);
    return x;
}


export { matrixMultiply, invert3x3Matrix, solveLinearSystem };

