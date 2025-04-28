# Deployment Guide for Hoop Shot Analytics (with CourtVision Integration)

This guide explains how to build and deploy the Hoop Shot Analytics application after integrating the CourtVision AI components.

## Overview

The application is built using React and Vite. The integrated CourtVision components (ball detection, calibration, tracking) run client-side using ONNX runtime and WebAssembly. Therefore, the application can be deployed as a static website.

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- CourtVision integration completed as per `INTEGRATION.md`

## Build Process

1.  **Navigate to the project root directory**:

    ```bash
    cd /path/to/hoop-shot-analytics
    ```

2.  **Run the build command**:

    ```bash
    npm run build
    ```

    This command will compile the React application and generate optimized static files (HTML, CSS, JavaScript) in the `dist/` directory.

## Deployment Options

The contents of the `dist/` directory can be deployed to any static web hosting provider.

**Important Requirements:**

*   **HTTPS:** The application **must** be served over HTTPS. Camera access (`getUserMedia`) is restricted to secure contexts (HTTPS or localhost).
*   **WASM Files:** Ensure your hosting provider correctly serves the `.wasm` files (`ort-wasm.wasm`, `ort-wasm-simd.wasm`, `ort-wasm-threaded.wasm`) located in the root of the deployment directory (copied from the `public` folder during the build) with the correct MIME type (`application/wasm`). Most modern static hosts handle this automatically.
*   **ONNX Model:** The ONNX model file (`yolov9_basketball_detector.onnx` or your custom model) located in the root of the deployment directory (copied from the `public` folder) must also be served correctly.

### Option 1: Netlify

1.  Sign up or log in to [Netlify](https://www.netlify.com/).
2.  Connect your Git repository (GitHub, GitLab, Bitbucket).
3.  Configure the build settings:
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
4.  Deploy the site. Netlify handles HTTPS and MIME types automatically.

### Option 2: Vercel

1.  Sign up or log in to [Vercel](https://vercel.com/).
2.  Import your Git repository.
3.  Vercel usually auto-detects Vite projects.
    *   Ensure the **Build Command** is set to `npm run build`.
    *   Ensure the **Output Directory** is set to `dist`.
4.  Deploy. Vercel handles HTTPS and MIME types automatically.

### Option 3: GitHub Pages

1.  **Configure `vite.config.js`:** Set the `base` option in your `vite.config.js` to your repository name if deploying to `https://<username>.github.io/<repo-name>/`:

    ```javascript
    // vite.config.js
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react-swc'

    export default defineConfig({
      plugins: [react()],
      base: '/hoop-shot-analytics/' // Replace with your repository name
    })
    ```

2.  **Build the project:** `npm run build`
3.  **Deploy:**
    *   You can manually push the contents of the `dist` folder to the `gh-pages` branch of your repository.
    *   Alternatively, use a package like `gh-pages` to automate deployment:
        ```bash
        npm install gh-pages --save-dev
        ```
        Add a script to `package.json`:
        ```json
        "scripts": {
          "deploy": "gh-pages -d dist"
        }
        ```
        Run the deployment script:
        ```bash
        npm run deploy
        ```
4.  **Configure GitHub Repository:** Go to your repository settings > Pages. Select the `gh-pages` branch as the source and ensure HTTPS is enforced.

### Option 4: Other Static Hosts (AWS S3, Google Cloud Storage, etc.)

1.  Build the project: `npm run build`
2.  Upload the contents of the `dist/` directory to your chosen hosting service (e.g., S3 bucket, GCS bucket).
3.  Configure the hosting service for static website hosting.
4.  **Crucially:**
    *   Ensure HTTPS is configured (e.g., using CloudFront for S3, or Load Balancer for GCS).
    *   Configure the correct MIME type for `.wasm` files (`application/wasm`).

## Post-Deployment Checks

1.  Access the deployed application URL.
2.  Verify that the application loads correctly.
3.  Test camera access – you should be prompted for permission.
4.  Test the ball detection and tracking features.
5.  Test court calibration.
6.  Check the browser's developer console for any errors related to model loading, WASM files, or camera access.

