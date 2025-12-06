import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Star, Award, Sparkles, 
  Eye, EyeOff, Trophy, Zap, ChevronRight, 
  BookOpen, Calendar, Clock, CheckCircle, PartyPopper 
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  // 🎯 THÊM: State cho hiệu ứng khi hoàn thành task
  const [showTaskComplete, setShowTaskComplete] = useState(false);

  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    currentLevelPoints: 0,
    pointsToNextLevel: 100,
    totalSessions: 0,
    streak: 0
  });

  const sessionDuration = 25 * 60; 
  const progressValue = ((sessionDuration - timeLeft) / sessionDuration) * 100;

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
    loadProgress();
  }, [user?.id]);

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

  useEffect(() => {
    const handleKeyDown = () => {
      if (showCelebration) {
        setShowCelebration(false);
      }
      if (showTaskComplete) {
        setShowTaskComplete(false);
      }
    };

    if (showCelebration || showTaskComplete) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('click', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleKeyDown);
    };
  }, [showCelebration, showTaskComplete]);

  const loadTasks = async () => {
    try {
      const data = await taskApi.getTasksByChildId(user!.id!);
      const taskList = Array.isArray(data) ? data : (data as any).data || [];
      const sortedTasks = taskList.sort((a : any, b : any) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status as TaskStatus] || 2) - (priority[b.status as TaskStatus] || 2);
      }); 
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
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
      toast.warning("Đang trong phiên làm việc, hãy hoàn thành hoặc dừng lại trước nhé!");
      return;
    }
    setCurrentTask(task);
    setIsBreak(false);
    setTimeLeft(25 * 60); 
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleToggleTimer = async () => {
    if (isActive) {
      setIsActive(false);
      return;
    }
    // setFocusMode(true);
    if (currentTask && !isBreak) {
      if (currentTask.status === TaskStatus.TODO) {
        try {
          await taskApi.updateStatus(currentTask.id, TaskStatus.IN_PROGRESS);
          const updatedTask = { ...currentTask, status: TaskStatus.IN_PROGRESS };
          setCurrentTask(updatedTask);
          setTasks(prevTasks => 
            prevTasks.map(t => t.id === currentTask.id ? updatedTask : t)
          );
        } catch (error) {
          console.error("Không thể cập nhật trạng thái", error);
        }
      }
    }
    setIsActive(true);
  };

  // 🎯 CẢI TIẾN: Hàm hoàn thành task với hiệu ứng đẹp
  const handleCompleteCurrentTask = async () => {
    if (!currentTask) return;

    try {
      // 🎉 Phát âm thanh vui vẻ
      playSuccessSound();
      
      // 🎊 Hiện hiệu ứng hoàn thành
      setShowTaskComplete(true);
      
      // ⏸️ Tạm dừng đồng hồ
      setIsActive(false);

      // 📡 Cập nhật lên server
      await taskApi.updateStatus(currentTask.id, TaskStatus.COMPLETED);

      // 🎁 Cộng điểm thưởng
      addPoints(100); // Thưởng nhiều hơn vì hoàn thành task!
      
      // 🔄 Cập nhật UI
      const updatedTasks = tasks.map(t => 
        t.id === currentTask.id ? { ...t, status: TaskStatus.COMPLETED } : t
      );
      
      const sortedTasks = updatedTasks.sort((a, b) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status] || 2) - (priority[b.status] || 2);
      });
      
      setTasks(sortedTasks);

      // ⏱️ Sau 2 giây reset đồng hồ
      setTimeout(() => {
        setShowTaskComplete(false);
        setCurrentTask(null);
        setTimeLeft(25 * 60);
        toast.success(`Tuyệt vời! Bạn vừa hoàn thành "${currentTask.title}" 🌟`, {
          duration: 5000,
        });
      }, 2000);

    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể cập nhật lúc này.");
    }
  };

  const handleToggleCheck = async (task: Task) => {
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const newStatus = isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED;

    try {
      await taskApi.updateStatus(task.id, newStatus);

      if (newStatus === TaskStatus.COMPLETED) {
        playSuccessSound();
        addPoints(50);
        toast.success(`Hoan hô! Đã hoàn thành "${task.title}" 🎉`);
        
        if (currentTask?.id === task.id) {
           setIsActive(false);
           setCurrentTask(null);
           setShowCelebration(true);
        }
      } else {
        toast.info(`Đã mở lại nhiệm vụ "${task.title}"`);
      }

      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      
      const sortedTasks = updatedTasks.sort((a, b) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status] || 2) - (priority[b.status] || 2);
      });
      
      setTasks(sortedTasks);

    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Không thể cập nhật trạng thái lúc này.");
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (!isBreak) {
      setShowCelebration(true);
      addPoints(50); 

      setTimeout(() => {
        setShowCelebration(false);
        setIsBreak(true);
        setTimeLeft(5 * 60);
        toast.success('Great job! Take a 5-minute break! 🌟');
      }, 3000);
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60);
      toast.info('Break time is over, back to studying! 💪');
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

  // 🎵 Âm thanh vui vẻ hơn khi hoàn thành
  const playSuccessSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString || isoString.startsWith('0001')) return null;
    return new Date(isoString).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
  };

  const getTaskStyle = (status: string) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return { bg: '#E8F5FF', border: '2px solid #3B82F6', badge: 'bg-blue-500', label: 'In Progress', btn: 'Continue' };
      case TaskStatus.COMPLETED:
        return { bg: '#F0FDF4', border: '2px solid transparent', badge: 'bg-green-500', label: 'Completed', btn: 'Review' };
      default:
        return { bg: 'white', border: '2px solid transparent', badge: 'bg-yellow-500', label: 'New', btn: 'Start' };
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isBreak) {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(25 * 60); 
    }
  };

  const getMascotMood = () => {
    if (showCelebration || showTaskComplete) return 'celebrating';
    if (isBreak) return 'resting';
    if (isActive) return 'focused';
    return 'happy';
  };

  return (
    <div className="h-full" style={{ background: 'linear-gradient(135deg, #E8F5FF 0%, #DFF7E8 100%)' }}>
      <div className="flex h-full">
        {/* Gamification Sidebar */}
        <AnimatePresence mode="wait">
          {!focusMode && (
            <motion.div
              layout
              className="border-r p-4 h-full overflow-hidden flex flex-col shrink-0"
              style={{ backgroundColor: 'white' }}
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ 
                width: 320, 
                opacity: 1, 
                x: 0,
                transition: { 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }
              }}
              exit={{ 
                width: 0, 
                opacity: 0, 
                x: -50,
                transition: { 
                  duration: 0.2,
                  ease: "easeInOut"
                }
              }}
            >
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

              <Card className="p-4 rounded-2xl border-0 mb-4" style={{ backgroundColor: '#E8F5FF' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: '#FFD966', fill: '#FFD966' }} />
                    <h3 style={{ color: '#333333' }}>Total Points</h3>
                  </div>
                  <p className="text-2xl" style={{ color: '#333333' }}>{userProgress.totalPoints}</p>
                </div>
              </Card>

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

        <div className="flex-1 h-full overflow-y-auto min-h-0" ref={scrollContainerRef}>
          <div className="max-w-4xl mx-auto p-6 pb-24">

            {/* 🎯 KHU VỰC ĐỒNG HỒ - ĐÃ ĐƯỢC TỐI ƯU */}
            <motion.div className="mb-8" layout>
              <Card 
                className={`rounded-3xl border-0 relative overflow-hidden transition-all duration-300 gap-1 ${
                  focusMode ? 'p-8' : 'p-6'
                }`}
                style={{ backgroundColor: '#F7F4EE' }}
              >
                {!currentTask && !isBreak && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <p className="text-lg text-gray-500 font-medium">👇 Select a task below to get started!</p>
                  </div>
                )}
                
                {/* Header với tên task */}
                <div className="text-center mb-3 relative z-0">
                  {currentTask && !isBreak ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-3"
                    >
                      <Badge className="mb-2 px-4 py-1.5 text-sm bg-blue-100 text-blue-700 border-0 font-medium">
                        📚 Doing
                      </Badge>
                      <h2 className={`font-bold text-[#333333] px-4 ${focusMode ? 'text-2xl' : 'text-xl'}`}>
                        {currentTask.title}
                      </h2>
                    </motion.div>
                  ) : (
                    <Badge className={`mb-2 px-4 py-1.5 text-sm ${isBreak ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'} border-0 font-medium`}>
                      {isBreak ? '☕ Giờ giải lao' : '✨ Sẵn sàng?'}
                    </Badge>
                  )}
                  
                  {/* 🎯 ĐỒNG HỒ - KÍCH THƯỚC VỪA PHẢI */}
                  <div className="flex justify-center items-center py-3">
                    <div className="relative">
                      {/* Vòng tròn SVG */}
                      <svg 
                        width={focusMode ? "280" : "240"} 
                        height={focusMode ? "280" : "240"} 
                        className="transform -rotate-90 transition-all duration-300"
                      >
                        <circle 
                          cx={focusMode ? "140" : "120"} 
                          cy={focusMode ? "140" : "120"} 
                          r={focusMode ? "120" : "100"} 
                          stroke="#E5E7EB" 
                          strokeWidth={focusMode ? "14" : "12"} 
                          fill="none" 
                        />
                        <motion.circle
                          cx={focusMode ? "140" : "120"} 
                          cy={focusMode ? "140" : "120"} 
                          r={focusMode ? "120" : "100"}
                          stroke={isBreak ? '#4ADE80' : '#FFD966'}
                          strokeWidth={focusMode ? "14" : "12"} 
                          fill="none" 
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * (focusMode ? 120 : 100)}
                          animate={{ 
                            strokeDashoffset: 2 * Math.PI * (focusMode ? 120 : 100) * (1 - progressValue / 100) 
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      
                      {/* Mascot */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FocusMascot 
                          mood={getMascotMood()} 
                          size={focusMode ? 140 : 120} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thời gian */}
                  <motion.div 
                    className={`font-bold text-[#333333] mt-2 font-mono ${
                      focusMode ? 'text-6xl' : 'text-5xl'
                    }`}
                    animate={{ 
                      scale: timeLeft <= 10 && isActive ? [1, 1.05, 1] : 1,
                      color: timeLeft <= 10 && isActive ? '#EF4444' : '#333333'
                    }}
                    transition={{ 
                      repeat: timeLeft <= 10 && isActive ? Infinity : 0, 
                      duration: 1 
                    }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>

                  {/* 🎯 NÚT HOÀN THÀNH - CHỈ HIỆN KHI FOCUS MODE */}
                  {currentTask && !isBreak && focusMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={handleCompleteCurrentTask}
                        size="lg"
                        className="rounded-full h-10 px-8 text-lg font-bold bg-green-500 text-white hover:bg-green-600 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                      >
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Complete!
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Nút điều khiển */}
                <div className="flex justify-center gap-3 relative z-20 mt-4">
                  <Button
                    onClick={() => {
                      handleToggleTimer();
                      setFocusMode(!focusMode);
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!currentTask && !isBreak}
                    size="lg"
                    className={`rounded-full font-semibold bg-[#FFD966] text-[#333333] hover:bg-[#ffcf40] shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
                      focusMode ? 'px-10 h-16 text-xl' : 'h-14 px-8 text-lg'
                    }`}
                  >
                    {isActive ? (
                      <><Pause className={`mr-2 ${focusMode ? 'w-6 h-6' : 'w-5 h-5'}`} /> Pause</>
                    ) : (
                      <><Play className={`mr-2 ${focusMode ? 'w-6 h-6' : 'w-5 h-5'}`} /> {timeLeft < 25*60 ? 'Continue' : 'Start'}</>
                    )}
                  </Button>

                  
                  {(isActive || timeLeft < 25*60) && (
                    <Button
                      onClick={resetTimer}
                      size="lg"
                      variant="outline"
                      className={`rounded-full border-2 hover:scale-105 transition-all ${
                        focusMode ? 'h-16 w-16' : 'h-14 w-14'
                      }`}
                    >
                      <RotateCcw className={focusMode ? "w-6 h-6" : "w-5 h-5"} />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* DANH SÁCH NHIỆM VỤ */}
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
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl transition-all ${isSelected ? 'ring-2 ring-[#FFD966] ring-offset-2' : ''}`}
                            style={{ backgroundColor: style.bg, border: style.border }}
                          >
                            <div className="flex items-center gap-4">
                              
                              <div 
                                className="flex-1 cursor-pointer" 
                                onClick={() => selectTaskToFocus(task)}
                              >
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
                                
                                <h3 className={`font-bold text-lg ${task.status === TaskStatus.COMPLETED ? 'text-gray-400 line-through' : 'text-[#333333]'}`}>
                                  {task.title}
                                </h3>
                                
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
                                    onClick={() => selectTaskToFocus(task)}
                                    className="rounded-full bg-white text-[#333333] border hover:bg-[#FFD966] hover:border-[#FFD966]"
                                  >
                                    {isSelected && isActive ? 'In Progress...' : style.btn}
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

      {/* 🎊 HIỆU ỨNG HOÀN THÀNH TASK */}
      <AnimatePresence>
        {showTaskComplete && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100 rounded-3xl p-12 text-center max-w-lg mx-4 relative overflow-hidden shadow-2xl"
              initial={{ scale: 0.5, rotate: -10, y: 50 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                y: 0,
                transition: { type: "spring", damping: 15 }
              }}
            >
              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#FFD966', '#4ADE80', '#3B82F6', '#EF4444'][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: '-10%'
                    }}
                    animate={{
                      y: ['0vh', '110vh'],
                      rotate: [0, 360],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-6 relative z-10"
              >
                <PartyPopper className="w-32 h-32 mx-auto text-[#FFD966] fill-[#FFD966]" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-[#333333] mb-4 relative z-10">
                Awesome! 🌟
              </h2>
              <p className="text-xl text-gray-700 mb-8 relative z-10">
                You have completed the task!
              </p>

              <div className="flex justify-center gap-3 relative z-10">
                <Badge className="bg-[#FFD966] text-[#333333] text-2xl px-8 py-3 font-bold shadow-lg">
                  +100 Points
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 mt-6 relative z-10 italic">
                (Press any key or click to continue)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal (Khi hết giờ) */}
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
              <p className="text-xs text-gray-400 mb-4 relative z-10 italic animate-pulse">
                (Bấm phím bất kỳ hoặc click chuột để tiếp tục)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}