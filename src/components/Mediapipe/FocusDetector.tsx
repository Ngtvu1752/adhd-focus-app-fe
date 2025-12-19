import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type MascotMood = 'happy' | 'focused' | 'celebrating' | 'resting' | 'frustrated' | 'bored' | 'stressed' | 'surprised';

interface FocusDetectorProps {
  isFocusMode: boolean;
  onFocusChange: (status: 'FOCUSED' | 'DISTRACTED' | 'ABSENT', reason?: string) => void;
  onMoodChange?: (mood: MascotMood) => void;
}
// Cấu trúc dữ liệu hiệu chỉnh
interface CalibrationData {
  baselineYaw: number;   // Góc quay đầu tự nhiên khi nhìn thẳng
  baselinePitch: number; // Góc cúi/ngửa tự nhiên khi nhìn thẳng
  yawRange: number;      // Biên độ quay ngang cho phép
  pitchUpRange: number;  // Biên độ ngửa lên cho phép
  pitchDownRange: number;// Biên độ cúi xuống cho phép
}

export const FocusDetector: React.FC<FocusDetectorProps> = ({ isFocusMode, onFocusChange, onMoodChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const isPausedRef = useRef<boolean>(false);
  const lastValidHeadPoseRef = useRef<{ yaw: number, pitch: number }>({ yaw: 0, pitch: 0 });
  const missingFaceFramesRef = useRef<number>(0);
  const lastMoodRef = useRef<MascotMood>('focused');
  const smoothedScoresRef = useRef({
    smile: 0,
    frown: 0,
    surprise: 0
  });
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
        refineLandmarks: true,
        minFaceDetectionConfidence: 0.2, 
        minFacePresenceConfidence: 0.2
      } as any);
      setIsModelLoaded(true);
    };
    initMediaPipe();

    return () => stopCamera(); // Cleanup khi unmount
  }, []);

  useEffect(() => {
    if (isFocusMode && isModelLoaded) {
      startWebcam();
      updateStep(1); 
      setCalibrationProgress(0);
      progressRef.current = 0;
    } else {
      stopCamera();
      setCalibrationStep(0);
    }
  }, [isFocusMode, isModelLoaded]);

  const updateStep = (step: number) => {
    calibrationStepRef.current = step; 
    setCalibrationStepUI(step);        
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
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop(); // Lệnh này sẽ tắt đèn xanh trên camera vật lý
        // console.log("📷 Camera Track Stopped:", track.label);
      });

      videoRef.current.srcObject = null;
    }
    
  };

  const predictWebcam = async () => {
    if (!faceLandmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      const currentStep = calibrationStepRef.current;

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        missingFaceFramesRef.current = 0; // Reset bộ đếm

        const landmarks = results.faceLandmarks[0];
        
        // Cập nhật tư thế cuối cùng
        const currentPose = calculateHeadPose(landmarks);
        lastValidHeadPoseRef.current = currentPose;

        if (currentStep > 0 && currentStep < 4 && !isPausedRef.current) {
          processCalibration(landmarks);
        } else if (currentStep === 4) {
          processAttention(landmarks);
        }

        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
           detectEmotion(results.faceBlendshapes[0].categories);
        }
      } else {
         // MẤT DẤU KHUÔN MẶT
        
         // Tăng bộ đếm frame bị mất
         missingFaceFramesRef.current++;

         // LẤY DỮ LIỆU CUỐI CÙNG ĐỂ SUY LUẬN
         const lastPitch = lastValidHeadPoseRef.current.pitch - calibrationConfig.current.baselinePitch;
         const lastYaw = lastValidHeadPoseRef.current.yaw - calibrationConfig.current.baselineYaw;

         // Điều kiện: Góc cúi cuối cùng > 15 độ (tương đối so với baseline)
         const isLookingDown = lastPitch > 15; 
         
         // Nếu đang cúi viết bài, cho phép mất mặt tới 450 frames (khoảng 15 giây)
         // Nếu chỉ quay đầu, chỉ cho phép 90 frames (3 giây)
         const limitFrames = isLookingDown ? 450 : 90;

         if (missingFaceFramesRef.current < limitFrames) {
             
             if (isLookingDown) {
                 // Nếu đang cúi viết bài -> Coi là FOCUSED (Tập trung)
                 onFocusChange('FOCUSED'); 
                 
                 // Giữ UI màu xanh (Fake detected) để bé không bị xao nhãng
             } else {
                 onFocusChange('DISTRACTED', 'Mình cùng nhìn thẳng vào màn hình nhé!');
             }
         } else {
             onFocusChange('ABSENT', 'Bạn ơi, quay lại ghế ngồi nào!');
         }
      }
    }
    
    if (isFocusMode) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  const detectEmotion = (blendshapes: any[]) => {
    const getScore = (name: string) => blendshapes.find(b => b.categoryName === name)?.score || 0;

    // 1. Lấy dữ liệu thô (Raw Data)
    const rawSmile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
    const rawFrown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
    const rawSurprise = getScore('browInnerUp');

    const smoothFactor = 0.7; 
    
    smoothedScoresRef.current.smile = (smoothedScoresRef.current.smile * smoothFactor) + (rawSmile * (1 - smoothFactor));
    smoothedScoresRef.current.frown = (smoothedScoresRef.current.frown * smoothFactor) + (rawFrown * (1 - smoothFactor));
    smoothedScoresRef.current.surprise = (smoothedScoresRef.current.surprise * smoothFactor) + (rawSurprise * (1 - smoothFactor));

    const { smile, frown, surprise } = smoothedScoresRef.current;

    const currentMood = lastMoodRef.current;

    let detectedMood: MascotMood = 'focused'; // Mặc định

    const isSmiling = currentMood === 'happy' || currentMood === 'celebrating'
        ? smile > 0.4 
        : smile > 0.6;

    // --- LOGIC STRESSED ---
    const isStressed = currentMood === 'stressed' 
        ? frown > 0.4 
        : frown > 0.55;

    // --- LOGIC SURPRISED ---
    const isSurprised = currentMood === 'surprised' 
        ? surprise > 0.4 
        : surprise > 0.55;

    // 4. Quyết định Mood (Ưu tiên)
    if (isSmiling) {
        detectedMood = smile > 0.85 ? 'celebrating' : 'happy';
    } else if (isStressed) {
        detectedMood = 'stressed';
    } else if (isSurprised) {
        detectedMood = 'surprised';
    }

    // 5. Chỉ update khi có thay đổi
    if (currentMood !== detectedMood) {
        lastMoodRef.current = detectedMood;
        if (onMoodChange) onMoodChange(detectedMood);
        console.log(`Mood changed: ${detectedMood} (Smile: ${smile.toFixed(2)})`);
    }
  };

  const handleMoodUpdate = (newMood: MascotMood) => {
      if (lastMoodRef.current !== newMood) {
          lastMoodRef.current = newMood;
          if (onMoodChange) onMoodChange(newMood);
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
    isPausedRef.current = true;

    const dataCount = tempCalibrationData.current.yaw.length;
    
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

    if (currentStep === 1) {
      calibrationConfig.current.baselineYaw = avgYaw;
      calibrationConfig.current.baselinePitch = avgPitch;
      
      // Chuyển sang Step 2 trên UI ngay để người dùng biết mà liếc mắt
      updateStep(2);
    } 
    else if (currentStep === 2) {
      // Tính biên độ
      const rawYawRange = Math.abs(avgYaw - calibrationConfig.current.baselineYaw);
      const rawPitchUpRange = Math.abs(avgPitch - calibrationConfig.current.baselinePitch);
      calibrationConfig.current.yawRange = (rawYawRange * 1.2) + 10;
      calibrationConfig.current.pitchUpRange = (rawPitchUpRange * 1.2) + 5;
      
      updateStep(3);
    }
    else if (currentStep === 3) {
      const currentYawRange = Math.abs(avgYaw - calibrationConfig.current.baselineYaw) * 1.5;
      const currentPitchDownRange = Math.abs(avgPitch - calibrationConfig.current.baselinePitch) * 1.5;
      
      calibrationConfig.current.yawRange = Math.max(calibrationConfig.current.yawRange, currentYawRange, 25);
      calibrationConfig.current.pitchDownRange = Math.max(currentPitchDownRange, 30);

      console.log("CALIBRATION COMPLETE:", calibrationConfig.current);
      updateStep(4); // Hoàn tất
    }

    tempCalibrationData.current = { yaw: [], pitch: [] };
    progressRef.current = 0;
    setCalibrationProgress(0);

    setTimeout(() => {
        if (calibrationStepRef.current < 4) {
            console.log("▶️ Tiếp tục thu thập dữ liệu...");
            isPausedRef.current = false; 
        } else {
             isPausedRef.current = false; 
        }
    }, 1500); // Delay 1.5 giây
  };

  const processAttention = (landmarks: any[]) => {
    const headPose = calculateHeadPose(landmarks);
    const gaze = calculateGaze(landmarks);
    const config = calibrationConfig.current;

    const relativeYaw = headPose.yaw - config.baselineYaw;
    const relativePitch = headPose.pitch - config.baselinePitch;

    let isDistracted = false;
    let reason = '';

    // So sánh với Range cá nhân hóa
    if (Math.abs(relativeYaw) > config.yawRange) {
      isDistracted = true;
      reason = 'Mình cùng nhìn thẳng vào màn hình nhé!';
    } 
    // Pitch: Cúi quá ngưỡng cho phép HOẶC Ngửa quá ngưỡng cho phép
    // Lưu ý: Giả định Pitch > 0 là cúi, Pitch < 0 là ngửa (cần check log thực tế)
    else if (relativePitch > config.pitchDownRange) {
      isDistracted = true;
      reason = 'Ngồi thẳng lưng lên cho khỏe nào!';
    }
    else if (relativePitch < -config.pitchUpRange) {
      isDistracted = true;
      reason = 'Nhìn xuống bài học chút xíu nào!';
    }
    // Gaze: Vẫn dùng ngưỡng cứng cho mắt vì mắt di chuyển rất nhanh
    else if (Math.abs(gaze.x) > 0.25) { // Tăng nhẹ lên 0.25 cho đỡ nhạy
      isDistracted = true;
      reason = 'Mắt xinh tập trung vào bài nhé!';
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
        className="fixed bottom-4 right-4 w-32 h-24 rounded-lg border-2 border-white shadow-lg z-[50] object-cover" 
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
              top: calibrationStepUI === 1 ? '50%' : (calibrationStepUI === 2 ? '10%' : '90%'),
              left: calibrationStepUI === 1 ? '50%' : (calibrationStepUI === 2 ? '10%' : '90%'),
              transform: 'translate(-50%, -50%)'
            }}
          />

          <p className="mb-8 text-gray-300">
            Hãy <span className="text-[#FFD966] font-bold">xoay đầu tự nhiên</span> để nhìn vào chấm đỏ nhé!
          </p>
        </div>
      )}
    </>
  );
};