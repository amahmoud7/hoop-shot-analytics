import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { toast } from '@/components/ui/use-toast';
import CameraFeed from '@/components/CameraFeed';
import { CalibrationPoint } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

const Calibration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  // Predefined calibration points to collect
  const requiredPoints = [
    { label: "Top Left Corner", hint: "Tap the top left corner of the court" },
    { label: "Top Right Corner", hint: "Tap the top right corner of the court" },
    { label: "Bottom Left Corner", hint: "Tap the bottom left corner of the court" },
    { label: "Bottom Right Corner", hint: "Tap the bottom right corner of the court" },
    { label: "Free Throw Line", hint: "Tap the middle of the free throw line" },
    { label: "Center of Hoop", hint: "Tap the center of the basketball hoop" }
  ];
  
  const currentPoint = requiredPoints[calibrationPoints.length] || requiredPoints[0];

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (calibrationPoints.length >= requiredPoints.length) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get coordinates from either touch or mouse event
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate relative position (0-100)
    const x = (clientX / viewportWidth) * 100;
    const y = (clientY / viewportHeight) * 100;
    
    // Add point
    const newPoint: CalibrationPoint = {
      x,
      y,
      label: currentPoint.label
    };
    
    setCalibrationPoints([...calibrationPoints, newPoint]);
    
    // If this was the last point, proceed to next step
    if (calibrationPoints.length + 1 === requiredPoints.length) {
      toast({
        title: "Calibration complete",
        description: "The court has been calibrated successfully.",
      });
      setStep(2);
    }
  };
  
  const handleReset = () => {
    setCalibrationPoints([]);
    setStep(1);
  };
  
  const handleComplete = () => {
    navigate('/tracking');
  };

  const handleCameraReady = () => {
    setCameraEnabled(true);
    toast({
      title: "Camera Ready",
      description: "Tap the court points for calibration",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Court Calibration" 
        showBack={true} 
        showMenu={false}
      />
      
      <div className="flex-1 flex flex-col">
        {step === 1 ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-navy mb-1">
                {currentPoint.label}
              </h2>
              <p className="text-sm text-gray-600">
                {currentPoint.hint}
              </p>
              <div className="mt-2 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-basketball rounded-full h-full transition-all"
                  style={{ width: `${(calibrationPoints.length / requiredPoints.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div 
              className="flex-1 relative"
              onClick={handleScreenTap}
              onTouchStart={handleScreenTap}
            >
              {/* Live camera feed */}
              <div className="absolute inset-0">
                <CameraFeed
                  onCameraReady={handleCameraReady}
                  autoStart={true}
                />
              </div>
              
              {/* Calibration points */}
              {calibrationPoints.map((point, index) => (
                <div 
                  key={index}
                  className="absolute w-6 h-6 bg-teal rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ 
                    left: `${point.x}%`, 
                    top: `${point.y}%`
                  }}
                >
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
              ))}
            </div>
            
            <div className="p-4">
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Reset Points
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            <div className="bg-white rounded-lg shadow p-5 flex-1 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-navy mb-2">Calibration Complete</h2>
                  <p className="text-gray-600 mb-6">
                    The court has been successfully calibrated. You're ready to start tracking!
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-basketball hover:bg-orange-600 text-white h-12"
                  onClick={handleComplete}
                >
                  Start Tracking
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  Recalibrate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calibration;
