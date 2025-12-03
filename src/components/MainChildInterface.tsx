import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Star, Award, Sparkles, 
  Eye, EyeOff, Trophy, Zap, ChevronRight, 
  BookOpen, Calendar, Clock, CheckCircle 
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FocusMascot } from './FocusMascot';
import { toast } from 'sonner';

import taskApi, {Task, TaskStatus} from '../api/taskApi';
import { useAuth } from '../context/AuthContext';

interface UserProgress {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  totalSessions: number;
  streak: number;
}

export function MainChildInterface() {
  const { user } = useAuth();
  // Task and Timer State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Focus Mode State
  const [focusMode, setFocusMode] = useState(false);

  // Gamification State
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    currentLevelPoints: 0,
    pointsToNextLevel: 100,
    totalSessions: 0,
    streak: 0
  });

  const totalDuration = isBreak ? 5 * 60 : (currentTask?.description ? 25 * 60 : 25 * 60); // Logic tạm
  // Lưu ý: Nếu task có duration thực tế từ DB thì dùng, ở đây tạm tính theo mặc định nếu API chưa trả về duration dạng phút
  // Giả sử API trả về dueDate/startTime nhưng chưa có duration cụ thể cho phiên, ta mặc định 25p hoặc lấy từ task nếu có field
  const sessionDuration = 25 * 60; 
  const progressValue = ((sessionDuration - timeLeft) / sessionDuration) * 100;

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
    loadProgress();
  }, [user?.id]);

  // 2. Logic Timer đếm ngược
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const loadTasks = async () => {
    try {
      const data = await taskApi.getTasksByChildId(user!.id!);
      const taskList = Array.isArray(data) ? data : (data as any).data || [];

      // Sắp xếp: IN_PROGRESS -> TODO -> COMPLETED
      const sortedTasks = taskList.sort((a : any, b : any) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status as TaskStatus] || 2) - (priority[b.status as TaskStatus] || 2);
      }); 

      setTasks(sortedTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
      // toast.error("Không tải được danh sách bài tập.");
    }
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  };

  const selectTaskToFocus = (task: Task) => {
    if (isActive) {
      toast.warning("Bạn đang trong phiên làm việc, hãy hoàn thành hoặc dừng lại trước nhé!");
      return;
    }
    setCurrentTask(task);
    setIsBreak(false);
    setTimeLeft(25 * 60); // Mặc định 1 phiên là 25 phút
    
    // Tự động cuộn lên đầu trang (nếu cần)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (!isBreak) {
      // Kết thúc phiên tập trung
      setShowCelebration(true);
      addPoints(50); 
      
      // Nếu có task đang chọn, có thể gọi API update status thành DONE hoặc log session (Tùy logic)
      // await userApi.saveSession(...)

      setTimeout(() => {
        setShowCelebration(false);
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 phút nghỉ ngơi
        toast.success('Làm tốt lắm! Nghỉ giải lao 5 phút nhé! 🌟');
      }, 3000);
    } else {
      // Kết thúc giờ nghỉ
      setIsBreak(false);
      setTimeLeft(25 * 60);
      toast.info('Hết giờ nghỉ rồi, quay lại học bài nào! 💪');
    }
  };

  const saveProgress = (newProgress: UserProgress) => {
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    setUserProgress(newProgress);
  };

  const calculateLevel = (points: number) => {
    const level = Math.floor(points / 100) + 1;
    const currentLevelPoints = points % 100;
    return { level, currentLevelPoints, pointsToNextLevel: 100 - currentLevelPoints };
  };

  const addPoints = (points: number) => {
    const newTotal = userProgress.totalPoints + points;
    const levelInfo = calculateLevel(newTotal);
    const newProgress = {
      ...userProgress,
      totalPoints: newTotal,
      level: levelInfo.level,
      currentLevelPoints: levelInfo.currentLevelPoints,
      pointsToNextLevel: levelInfo.pointsToNextLevel,
      totalSessions: userProgress.totalSessions + 1
    };
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    setUserProgress(newProgress);
  };


  const playSound = () => {
    // Âm thanh đơn giản
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523.25; 
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString || isoString.startsWith('0001')) return null;
    return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getTaskStyle = (status: string) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return { bg: '#E8F5FF', border: '2px solid #3B82F6', badge: 'bg-blue-500', label: 'Đang làm dở', btn: 'Continue' };
      case TaskStatus.COMPLETED:
        return { bg: '#F0FDF4', border: '2px solid transparent', badge: 'bg-green-500', label: 'Đã xong', btn: 'Review' };
      default:
        return { bg: 'white', border: '2px solid transparent', badge: 'bg-yellow-500', label: 'Mới', btn: 'Start' };
    }
  };

  const toggleTimer = () => {
    if (!currentTask && !isBreak) {
      toast.error('Please select a task first!');
      return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false); // Dừng đồng hồ
    
    if (isBreak) {
      // Nếu đang là giờ nghỉ -> Reset về 5 phút
      setTimeLeft(5 * 60);
    } else {
      // Nếu đang làm việc -> Reset về 25 phút (Mặc định)
      // (Khi nào Backend có trường duration thì sửa thành: currentTask?.duration || 25)
      setTimeLeft(25 * 60); 
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      toast.success('Focus Mode activated! Minimize distractions 🎯');
    }
  };


  const getMascotMood = () => {
    if (showCelebration) return 'celebrating';
    if (isBreak) return 'resting';
    if (isActive) return 'focused';
    return 'happy';
  };


  return (
    <div className="h-full" style={{ background: 'linear-gradient(135deg, #E8F5FF 0%, #DFF7E8 100%)' }}>
      <div className="flex h-full">
        {/* Gamification Sidebar - Hidden in Focus Mode */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              className="w-80 border-r p-4 h-full overflow-hidden flex flex-col shrink-0"
              style={{ backgroundColor: 'white' }}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* User Level Card */}
              <Card className="p-4 rounded-2xl border-0 mb-4" style={{ backgroundColor: '#FFD966' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                    <Trophy className="w-8 h-8" style={{ color: '#FFD966' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#333333' }}>Level</p>
                    <p className="text-3xl" style={{ color: '#333333' }}>{userProgress.level}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm" style={{ color: '#333333' }}>
                    <span>Progress to Level {userProgress.level + 1}</span>
                    <span>{userProgress.currentLevelPoints}/100</span>
                  </div>
                  <Progress value={userProgress.currentLevelPoints} className="h-3" />
                  <p className="text-sm text-center" style={{ color: '#333333' }}>
                    {userProgress.pointsToNextLevel} points to next level!
                  </p>
                </div>
              </Card>

              {/* Points Card */}
              <Card className="p-4 rounded-2xl border-0 mb-4" style={{ backgroundColor: '#E8F5FF' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: '#FFD966', fill: '#FFD966' }} />
                    <h3 style={{ color: '#333333' }}>Total Points</h3>
                  </div>
                  <p className="text-2xl" style={{ color: '#333333' }}>{userProgress.totalPoints}</p>
                </div>
              </Card>

              {/* Stats Cards - SỬA 5: Chuyển sang Grid 2 cột để tiết kiệm chiều cao */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="p-3 rounded-xl border-0" style={{ backgroundColor: '#DFF7E8' }}>
                  <div className="flex flex-col items-center text-center">
                    <Zap className="w-5 h-5 mb-1" style={{ color: '#333333' }} />
                    <span className="text-xs text-gray-600">Sessions</span>
                    <p className="text-lg font-bold" style={{ color: '#333333' }}>{userProgress.totalSessions}</p>
                  </div>
                </Card>

                <Card className="p-3 rounded-xl border-0" style={{ backgroundColor: '#F7F4EE' }}>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-lg mb-1">🔥</span>
                    <span className="text-xs text-gray-600">Streak</span>
                    <p className="text-lg font-bold" style={{ color: '#333333' }}>{userProgress.streak}</p>
                  </div>
                </Card>
              </div>

              {/* Achievements Preview - Thu gọn */}
              <Card className="p-4 rounded-xl border-0" style={{ backgroundColor: 'white', border: '2px dashed #FFD966' }}>
                <h3 className="mb-2 text-sm font-medium" style={{ color: '#333333' }}>Next Rewards</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" style={{ color: '#FFD966' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#333333' }}>Focus Master</p>
                      <p className="text-[10px] text-gray-500 truncate">Complete 10 sessions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" style={{ color: '#DFF7E8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#333333' }}>Time Champion</p>
                      <p className="text-[10px] text-gray-500 truncate">Reach Level 5</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 h-full overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto p-6 pb-24">
            
            {/* Nút Focus Mode */}
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setFocusMode(!focusMode)}
                variant="outline"
                className="rounded-full border-gray-200 hover:bg-[#FFD966] hover:border-[#FFD966]"
              >
                {focusMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {focusMode ? 'Menu' : 'Focus Mode'}
              </Button>
            </div>

            {/* 1. KHU VỰC ĐỒNG HỒ (Luôn hiện) */}
            <motion.div className="mb-8" layout>
              <Card className="p-8 rounded-3xl border-0 bg-[#F7F4EE] relative overflow-hidden">
                {!currentTask && !isBreak && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <p className="text-lg text-gray-500 font-medium">👇 Select a task below to get started!</p>
                  </div>
                )}
                
                {/* Header Đồng hồ */}
                <div className="text-center mb-6 relative z-0">
                  <Badge className={`mb-4 px-4 py-1 text-sm ${isBreak ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'} border-0`}>
                    {isBreak ? '☕ Break Time' : (currentTask ? currentTask.title : 'Ready?')}
                  </Badge>
                  
                  {/* Mascot & Timer Circle */}
                  <div className="flex justify-center items-center py-4">
                    <div className="relative">
                      {/* Vòng tròn SVG */}
                      <svg width="240" height="240" className="transform -rotate-90">
                        <circle cx="120" cy="120" r="100" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                        <motion.circle
                          cx="120" cy="120" r="100"
                          stroke={isBreak ? '#4ADE80' : '#FFD966'}
                          strokeWidth="12" fill="none" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 100}
                          animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progressValue / 100) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      
                      {/* Mascot nằm giữa */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FocusMascot mood={getMascotMood()} size={120} />
                      </div>
                    </div>
                  </div>

                  {/* Thời gian số */}
                  <div className="text-6xl font-bold text-[#333333] mt-2 font-mono">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Nút điều khiển */}
                <div className="flex justify-center gap-4 relative z-20">
                  <Button
                    onClick={() => { setIsActive(!isActive); setFocusMode(!focusMode); }}
                    disabled={!currentTask && !isBreak}
                    size="lg"
                    className="rounded-full h-14 px-8 text-lg font-semibold bg-[#FFD966] text-[#333333] hover:bg-[#ffcf40] shadow-lg hover:shadow-xl transition-all"
                  >
                    {isActive ? (
                      <><Pause className="w-6 h-6 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-6 h-6 mr-2" /> {timeLeft < 25*60 ? 'Resume' : 'Start'}</>
                    )}
                  </Button>
                  {(isActive || timeLeft < 25*60) && (
                    <Button
                      onClick={resetTimer} // <--- Gọi hàm vừa tạo
                      size="lg"
                      variant="outline"
                      className="rounded-full h-14 w-14 p-0 border-2"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                  )}
                  
                </div>
              </Card>
            </motion.div>

            {/* 2. DANH SÁCH NHIỆM VỤ (Ẩn khi Focus Mode) */}
            <AnimatePresence>
              {!focusMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-[#FFD966]" />
                    <h2 className="text-xl font-bold text-[#333333]">Task List</h2>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-400">No tasks for today. Awesome! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const style = getTaskStyle(task.status);
                        const isSelected = currentTask?.id === task.id;
                        
                        return (
                          <motion.div
                            key={task.id}
                            onClick={() => selectTaskToFocus(task)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-4 rounded-2xl cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#FFD966] ring-offset-2' : ''}`}
                            style={{ backgroundColor: style.bg, border: style.border }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`${style.badge} text-white border-0 hover:${style.badge}`}>
                                    {style.label}
                                  </Badge>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500 flex items-center bg-white/60 px-2 py-0.5 rounded-md">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatDate(task.dueDate)}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-[#333333] text-lg">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                {task.status === TaskStatus.COMPLETED ? (
                                  <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="rounded-full bg-white text-[#333333] border hover:bg-[#FFD966] hover:border-[#FFD966]"
                                  >
                                    {isSelected && isActive ? 'Working...' : style.btn}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Celebration Modal (Hiệu ứng chúc mừng) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 relative overflow-hidden"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <div className="absolute inset-0 bg-[#FFD966]/10" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mb-4 relative z-10"
              >
                <Sparkles className="w-20 h-20 mx-auto text-[#FFD966] fill-[#FFD966]" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#333333] mb-2 relative z-10">Excellent! 🎉</h2>
              <p className="text-gray-600 mb-6 relative z-10">You have completed the focus session.</p>
              <div className="flex justify-center gap-2 relative z-10">
                <Badge className="bg-[#FFD966] text-[#333333] text-lg px-4 py-1">+50 Points</Badge>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
