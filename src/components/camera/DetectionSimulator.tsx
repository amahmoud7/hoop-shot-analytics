
import { useEffect } from 'react';

interface DetectionSimulatorProps {
  enabled: boolean;
  onDetection?: (detection: any) => void;
}

const DetectionSimulator: React.FC<DetectionSimulatorProps> = ({ enabled, onDetection }) => {
  // Placeholder for detection simulation (temporary)
  useEffect(() => {
    if (enabled && onDetection) {
      // Simulate a detection event for demonstration purposes
      const detectionInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const simulatedDetection = {
            x: Math.random() * 100,
            y: Math.random() * 100,
            radius: 5 + Math.random() * 3,
            confidence: 0.7 + Math.random() * 0.3,
            timestamp: Date.now()
          };
          
          onDetection(simulatedDetection);
        }
      }, 1000);
      
      return () => clearInterval(detectionInterval);
    }
  }, [enabled, onDetection]);

  return null; // This component doesn't render anything
};

export default DetectionSimulator;
