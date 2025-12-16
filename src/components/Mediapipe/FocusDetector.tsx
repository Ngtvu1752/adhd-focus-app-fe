import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface FocusDetectorProps {
  isFocusMode: boolean; // Prop mới: Chỉ chạy khi bật Focus Mode
  onFocusChange: (status: 'FOCUSED' | 'DISTRACTED' | 'ABSENT', reason?: string) => void;
}

// Cấu trúc dữ liệu hiệu chỉnh
interface CalibrationData {
  baselineYaw: number;   // Góc quay đầu tự nhiên khi nhìn thẳng
  baselinePitch: number; // Góc cúi/ngửa tự nhiên khi nhìn thẳng
  yawRange: number;      // Biên độ quay ngang cho phép
  pitchUpRange: number;  // Biên độ ngửa lên cho phép
  pitchDownRange: number;// Biên độ cúi xuống cho phép
}

export const FocusDetector: React.FC<FocusDetectorProps> = ({ isFocusMode, onFocusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const isPausedRef = useRef<boolean>(false);
  // --- STATE CHO QUÁ TRÌNH HIỆU CHỈNH ---
  // Step: 0 (Chưa bắt đầu), 1 (Nhìn Tâm), 2 (Nhìn Góc Trái Trên), 3 (Nhìn Góc Phải Dưới), 4 (Hoàn tất)
  const [calibrationStep, setCalibrationStep] = useState<number>(0); 
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationStepUI, setCalibrationStepUI] = useState<number>(0);
  // Ref dùng để logic loop đọc được giá trị mới nhất ngay lập tức
  const calibrationStepRef = useRef<number>(0)
  const progressRef = useRef(0); // Dùng ref đếm progress cho chính xác
  // Dữ liệu thu thập tạm thời
  const tempCalibrationData = useRef<{yaw: number[], pitch: number[]}>({ yaw: [], pitch: [] });
  
  // Dữ liệu chuẩn sau khi hiệu chỉnh xong
  const calibrationConfig = useRef<CalibrationData>({
    baselineYaw: 0, baselinePitch: 0,
    yawRange: 30, pitchUpRange: 20, pitchDownRange: 45 // Giá trị mặc định an toàn
  });

  // Biến đếm chống nhiễu
  const distractionStreakRef = useRef<number>(0);
  const logCounterRef = useRef<number>(0);

  // --- 1. KHỞI TẠO AI (Chỉ chạy 1 lần khi mount) ---
  useEffect(() => {
    const initMediaPipe = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
        refineLandmarks: true
      } as any);
      setIsModelLoaded(true);
    };
    initMediaPipe();

    return () => stopCamera(); // Cleanup khi unmount
  }, []);

  // --- 2. BẬT/TẮT CAMERA DỰA TRÊN FOCUS MODE ---
  useEffect(() => {
    if (isFocusMode && isModelLoaded) {
      // Khi vào Focus Mode: Bắt đầu camera và quy trình hiệu chỉnh
      startWebcam();
      updateStep(1); 
      setCalibrationProgress(0);
      progressRef.current = 0;
    } else {
      // Khi thoát Focus Mode: Tắt camera
      stopCamera();
      setCalibrationStep(0);
    }
  }, [isFocusMode, isModelLoaded]);

  const updateStep = (step: number) => {
    calibrationStepRef.current = step; // Logic đọc cái này
    setCalibrationStepUI(step);        // UI đọc cái này
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Đảm bảo video play
        videoRef.current.play(); 
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    } catch (err) {
      console.error("Webcam error:", err);
      alert("Không thể mở camera. Vui lòng cấp quyền!");
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(requestRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // --- 3. VÒNG LẶP XỬ LÝ (LOOP) ---
  const predictWebcam = async () => {
    if (!faceLandmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      // 🔥 LOGIC KIỂM TRA MẶT
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        const currentStep = calibrationStepRef.current;

        // Chỉ chạy Calibration khi không bị PAUSE
        if (currentStep > 0 && currentStep < 4 && !isPausedRef.current) {
          processCalibration(landmarks);
        } else if (currentStep === 4) {
          processAttention(landmarks);
        }
      } else {
         if (calibrationStepRef.current === 4) onFocusChange('ABSENT', 'Không thấy khuôn mặt');
      }
    }
    
    if (isFocusMode) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  // --- 4. LOGIC HIỆU CHỈNH (CALIBRATION) ---
  const processCalibration = (landmarks: any[]) => {
    const headPose = calculateHeadPose(landmarks);
    
    tempCalibrationData.current.yaw.push(headPose.yaw);
    tempCalibrationData.current.pitch.push(headPose.pitch);

    // Cộng progress
    progressRef.current += 2; 
    
    // Cập nhật UI
    setCalibrationProgress(Math.min(progressRef.current, 100));
    
    // Debug log
    const currentStep = calibrationStepRef.current;
    if (progressRef.current % 20 === 0) {
        console.log(`Calibration Step ${currentStep}: Progress ${progressRef.current}%`);
    }

    // Nếu đầy cây -> Kết thúc bước
    if (progressRef.current >= 100) {
        finishCalibrationStep();
        // ❌ KHÔNG reset progressRef ở đây nữa để tránh Race Condition
    }
  };

  const finishCalibrationStep = () => {
    // 1. Tạm dừng thu thập ngay lập tức
    isPausedRef.current = true;

    // 2. Tính toán dữ liệu
    const dataCount = tempCalibrationData.current.yaw.length;
    
    // Safety check: Nếu không có dữ liệu (tránh NaN)
    if (dataCount === 0) {
        console.warn("Không thu thập được dữ liệu, thử lại bước này...");
        progressRef.current = 0;
        setCalibrationProgress(0);
        isPausedRef.current = false;
        return;
    }

    const avgYaw = tempCalibrationData.current.yaw.reduce((a, b) => a + b, 0) / dataCount;
    const avgPitch = tempCalibrationData.current.pitch.reduce((a, b) => a + b, 0) / dataCount;
    
    const currentStep = calibrationStepRef.current;
    console.log(`✅ Step ${currentStep} Done. AvgYaw: ${avgYaw.toFixed(2)}, AvgPitch: ${avgPitch.toFixed(2)}`);

    // 3. Lưu cấu hình
    if (currentStep === 1) {
      calibrationConfig.current.baselineYaw = avgYaw;
      calibrationConfig.current.baselinePitch = avgPitch;
      
      // Chuyển sang Step 2 trên UI ngay để người dùng biết mà liếc mắt
      updateStep(2);
    } 
    else if (currentStep === 2) {
      calibrationConfig.current.yawRange = Math.abs(avgYaw - calibrationConfig.current.baselineYaw) * 1.5;
      calibrationConfig.current.pitchUpRange = Math.abs(avgPitch - calibrationConfig.current.baselinePitch) * 1.5;
      
      // Chuyển sang Step 3 trên UI
      updateStep(3);
    }
    else if (currentStep === 3) {
      const currentYawRange = Math.abs(avgYaw - calibrationConfig.current.baselineYaw) * 1.5;
      const currentPitchDownRange = Math.abs(avgPitch - calibrationConfig.current.baselinePitch) * 1.5;
      
      calibrationConfig.current.yawRange = Math.max(calibrationConfig.current.yawRange, currentYawRange, 25);
      calibrationConfig.current.pitchDownRange = Math.max(currentPitchDownRange, 30);

      console.log("🎉 CALIBRATION COMPLETE:", calibrationConfig.current);
      updateStep(4); // Hoàn tất
    }

    // 4. RESET DỮ LIỆU & PROGRESS
    tempCalibrationData.current = { yaw: [], pitch: [] };
    progressRef.current = 0;
    setCalibrationProgress(0);

    // 5. SET TIMEOUT ĐỂ TIẾP TỤC (Tạo khoảng nghỉ 1.5 giây)
    // Trong 1.5s này: Chấm đỏ đã chuyển vị trí mới, nhưng progress bar chưa chạy.
    // Người dùng có thời gian để ổn định mắt tại vị trí mới.
    setTimeout(() => {
        if (calibrationStepRef.current < 4) {
            console.log("▶️ Tiếp tục thu thập dữ liệu...");
            isPausedRef.current = false; // Mở khóa cho phép thu thập tiếp
        } else {
             isPausedRef.current = false; // Mở khóa cho mode giám sát
        }
    }, 1500); // Delay 1.5 giây
  };

  // --- 5. LOGIC PHÁT HIỆN TẬP TRUNG (DÙNG DỮ LIỆU ĐÃ HIỆU CHỈNH) ---
  const processAttention = (landmarks: any[]) => {
    const headPose = calculateHeadPose(landmarks);
    const gaze = calculateGaze(landmarks);
    const config = calibrationConfig.current;

    // Tính độ lệch so với Baseline của người dùng (chứ không phải so với 0)
    const relativeYaw = headPose.yaw - config.baselineYaw;
    const relativePitch = headPose.pitch - config.baselinePitch;

    let isDistracted = false;
    let reason = '';

    // So sánh với Range cá nhân hóa
    if (Math.abs(relativeYaw) > config.yawRange) {
      isDistracted = true;
      reason = 'Quay đầu quá nhiều';
    } 
    // Pitch: Cúi quá ngưỡng cho phép HOẶC Ngửa quá ngưỡng cho phép
    // Lưu ý: Giả định Pitch > 0 là cúi, Pitch < 0 là ngửa (cần check log thực tế)
    else if (relativePitch > config.pitchDownRange) {
      isDistracted = true;
      reason = 'Cúi đầu quá thấp';
    }
    else if (relativePitch < -config.pitchUpRange) {
      isDistracted = true;
      reason = 'Ngửa đầu quá cao';
    }
    // Gaze: Vẫn dùng ngưỡng cứng cho mắt vì mắt di chuyển rất nhanh
    else if (Math.abs(gaze.x) > 0.25) { // Tăng nhẹ lên 0.25 cho đỡ nhạy
      isDistracted = true;
      reason = 'Mắt không nhìn màn hình';
    }

    // Debounce Logic (Chống nhiễu)
    if (isDistracted) {
      distractionStreakRef.current++;
    } else {
      distractionStreakRef.current = 0;
      onFocusChange('FOCUSED');
    }

    if (distractionStreakRef.current > 90) { // ~1.5s
      onFocusChange('DISTRACTED', reason);
    }
    
    // Log throttle (để debug)
    logCounterRef.current++;
    if(logCounterRef.current % 60 === 0) {
        console.log(`Delta Yaw: ${relativeYaw.toFixed(1)} (Limit: ${config.yawRange.toFixed(1)})`);
    }
  };

  // Các hàm tính toán hình học (Giữ nguyên như phiên bản trước)
  const calculateHeadPose = (landmarks: any[]) => {
      const nose = landmarks[1];
      const leftEar = landmarks[454];
      const rightEar = landmarks[234];
      const chin = landmarks[152];
      const forehead = landmarks[10];
  
      // Yaw
      const distToLeft = Math.abs(nose.x - leftEar.x);
      const distToRight = Math.abs(nose.x - rightEar.x);
      const yawRatio = (distToLeft - distToRight) / (distToLeft + distToRight);
      const yaw = yawRatio * 90; 
  
      // Pitch (Giả định: Dương là cúi, Âm là ngửa)
      const faceHeight = Math.abs(chin.y - forehead.y);
      const noseY = nose.y;
      const midY = (chin.y + forehead.y) / 2;
      const pitchRatio = (noseY - midY) / faceHeight; 
      const pitch = pitchRatio * 180; 
  
      return { yaw, pitch };
  };

  const calculateGaze = (landmarks: any[]) => {
      const leftIris = landmarks[468];
      const rightIris = landmarks[473];
      const getEyeRatio = (iris: any, inner: any, outer: any) => {
          const width = Math.abs(outer.x - inner.x);
          const dist = Math.abs(iris.x - inner.x);
          return (dist / width) - 0.5; 
      };
      const leftRatio = getEyeRatio(leftIris, landmarks[33], landmarks[133]);
      const rightRatio = getEyeRatio(rightIris, landmarks[362], landmarks[263]);
      return { x: (leftRatio + rightRatio) / 2 };
  };

  // --- RENDER GIAO DIỆN ---
  // Nếu không ở Focus Mode -> Không render gì cả (hoặc null)
  if (!isFocusMode) {
    return null;
    }
  return (
    <>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="hidden" 
        />

      {/* Sử dụng calibrationStepUI (State) để render */}
      {calibrationStepUI > 0 && calibrationStepUI < 4 && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-bold mb-4">⚙️ Thiết lập góc nhìn</h2>
          <p className="mb-8 text-gray-300">Giữ nguyên đầu và nhìn theo chấm đỏ nhé!</p>
          
          <div className="w-64 h-2 bg-gray-700 rounded-full mb-8">
            <div 
              className="h-full bg-[#FFD966] rounded-full transition-all duration-100" 
              style={{ width: `${calibrationProgress}%` }}
            />
          </div>

          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse transition-all duration-500"
            style={{
              // Logic vị trí chấm đỏ
              top: calibrationStepUI === 1 ? '50%' : (calibrationStepUI === 2 ? '20%' : '80%'),
              left: calibrationStepUI === 1 ? '50%' : (calibrationStepUI === 2 ? '20%' : '80%'),
              transform: 'translate(-50%, -50%)'
            }}
          />

          <p className="text-xl font-bold mt-10">
            {calibrationStepUI === 1 && "Nhìn thẳng vào giữa màn hình"}
            {calibrationStepUI === 2 && "Nhìn lên góc TRÁI màn hình"}
            {calibrationStepUI === 3 && "Nhìn xuống góc PHẢI màn hình"}
          </p>
        </div>
      )}
    </>
  );
};