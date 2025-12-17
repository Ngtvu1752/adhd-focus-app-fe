import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Star, Award, Sparkles, 
  Eye, EyeOff, Trophy, Zap, ChevronRight, 
  BookOpen, Calendar, Clock, CheckCircle, PartyPopper, Coffee, SkipForward, Gift
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FocusMascot } from './FocusMascot';
import { toast } from 'sonner';

import taskApi, { Task, TaskStatus } from '../api/taskApi';
import pomodoroApi from '../api/pomodoroApi';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import { themes } from './util/colorTheme';

import { FocusDetector } from './Mediapipe/FocusDetector';
import { FocusBuddyReminder } from './FocusBuddyReminder';
import {RewardsShop} from './RewardsShop';

type TimerMode = 'focus' | 'short' | 'long';

interface UserProgress {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  totalSessions: number;
  streak: number;
}
interface MainChildInterfaceProps {
  onNavigate?: (target: string) => void;
}

export function MainChildInterface({onNavigate}: MainChildInterfaceProps) {
  const { user } = useAuth();
  
  // --- States ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0); 

  const [showCelebration, setShowCelebration] = useState(false);
  const [showTaskComplete, setShowTaskComplete] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const theme = themes[mode];
  const MAX_POMODORO = 4; 

  const calculateLevelInfo = (totalPoints: number) => {
    const level = Math.floor(totalPoints / 100) + 1;
    const currentLevelPoints = totalPoints % 100;
    const pointsToNextLevel = 100 - currentLevelPoints;
    return { level, currentLevelPoints, pointsToNextLevel };
  };
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0, level: 1, currentLevelPoints: 0, pointsToNextLevel: 100, totalSessions: 0, streak: 10
  });

  useEffect(() => {
    if (user) {
      // Nếu có user (từ API login), tính toán lại progress dựa trên user.totalPoints
      const points = user.totalPoints || 0;
      const levelInfo = calculateLevelInfo(points);
      
      setUserProgress(prev => ({
        ...prev,
        totalPoints: points,
        streak: user.currentStreak || 0,
        level: user.userLevel || levelInfo.level, // Ưu tiên level từ DB, nếu k có thì tự tính
        currentLevelPoints: levelInfo.currentLevelPoints,
        pointsToNextLevel: levelInfo.pointsToNextLevel,
        // totalSessions có thể cần API riêng, tạm thời giữ nguyên hoặc lấy từ localStorage nếu muốn
      }));
    } else {
      // Fallback: Nếu không có user (chưa login/mất mạng), thử lấy từ localStorage
      //const savedProgress = localStorage?.getItem('userProgress');
      //if (savedProgress) {
        //setUserProgress(JSON.parse(savedProgress));
      //}
      console.log("No user data available to load progress.");
    }
  }, [user]);
  const getDuration = () => {
    switch (mode) {
      case 'short': return 5 * 60;
      case 'long': return 15 * 60;
      default: return 25 * 60;
    }
  };
  const sessionDuration = getDuration();
  const progressValue = ((sessionDuration - timeLeft) / sessionDuration) * 100;

  useEffect(() => {
    if (user?.id) loadTasks();
    //loadProgress();
  }, [user?.id]);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (showCelebration) setShowCelebration(false);
      if (showTaskComplete) setShowTaskComplete(false);
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
    if (savedProgress) setUserProgress(JSON.parse(savedProgress));
  };
  const addPoints = (points: number) => {
    // 1. Tính toán điểm mới dựa trên state hiện tại
    const newTotal = userProgress.totalPoints + points;
    const levelInfo = calculateLevel(newTotal);
    
    const newProgress = { 
      ...userProgress, 
      totalPoints: newTotal, 
      ...levelInfo, 
      totalSessions: userProgress.totalSessions + 1 
    };
    
    // 2. Cập nhật UI ngay lập tức
    setUserProgress(newProgress);
    
    // 3. Lưu tạm vào localStorage (để nếu F5 thì vẫn thấy điểm mới)
    //localStorage.setItem('userProgress', JSON.stringify(newProgress));
    
    // KHÔNG GỌI API update points ở đây nữa vì Backend đã tự làm khi update Task
  };
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'short') setTimeLeft(5 * 60);
    else if (newMode === 'long') setTimeLeft(15 * 60);
    else setTimeLeft(25 * 60);
  };

  const selectTaskToFocus = (task: Task) => {
    if (isActive) {
      toast.warning("Đang trong phiên làm việc, hãy hoàn thành hoặc dừng lại trước nhé!");
      return;
    }
    setCurrentTask(task);
    
    switchMode('focus');
    
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleToggleTimer = async () => {
    if (isActive) {
      setIsActive(false);
      return;
    }

    const isNewSession = timeLeft === sessionDuration;
    
    if (mode === 'focus' && isNewSession && user?.id) {
      try {
        const newSession = await pomodoroApi.createPomodoroSession({
          childId: user.id,
          startTime: new Date().toISOString(),
          focusMinutes: 25,
          breakMinutes: 0,
        });
        
        if (newSession && newSession.id) {
          setCurrentSessionId(newSession.id);
          console.log("Started Pomodoro Session:", newSession.id);
        }
      } catch (error) {
        console.error("Failed to create pomodoro session", error);
      }
    }
    
    if (mode === 'focus' && currentTask) {
      if (currentTask.status === TaskStatus.TODO) {
        try {
          await taskApi.updateStatus(currentTask.id, TaskStatus.IN_PROGRESS);
          const updatedTask = { ...currentTask, status: TaskStatus.IN_PROGRESS };
          setCurrentTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === currentTask.id ? updatedTask : t));
        } catch (error) {
          console.error("Không thể cập nhật trạng thái", error);
        }
      }
    }
    setIsActive(true);
  };

  const handleCompleteCurrentTask = async () => {
    if (!currentTask) return;
    try {
      playSuccessSound();
      setShowTaskComplete(true);
      setIsActive(false);
      if (currentSessionId) {
        const minutesDone = Math.ceil((sessionDuration - timeLeft) / 60);
        
        await pomodoroApi.updatePomodoroSession(currentSessionId, {
          endTime: new Date().toISOString(),
          focusMinutes: minutesDone > 0 ? minutesDone : 1, 
        });
        setCurrentSessionId(null);
      }
      await taskApi.updateStatus(currentTask.id, TaskStatus.COMPLETED);
      addPoints(100);
      
      const updatedTasks = tasks.map(t => 
        t.id === currentTask.id ? { ...t, status: TaskStatus.COMPLETED } : t
      );
      const sortedTasks = updatedTasks.sort((a, b) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status] || 2) - (priority[b.status] || 2);
      });
      setTasks(sortedTasks);

      setTimeout(() => {
        setShowTaskComplete(false);
        setCurrentTask(null);
        // Sau khi hoàn thành task -> Vẫn giữ mode focus hoặc hỏi nghỉ? 
        // Ở đây ta cứ reset về 25p
        setTimeLeft(25 * 60);
        toast.success(`Tuyệt vời! Bạn vừa hoàn thành "${currentTask.title}" 🌟`, { duration: 5000 });
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
      loadTasks(); // Reload để sort lại
    } catch (error) {
      toast.error("Lỗi cập nhật.");
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    playSound();
    
    if (mode === 'focus') {
      // Hoàn thành phiên tập trung
      if (currentSessionId) {
        try {
          await pomodoroApi.updatePomodoroSession(currentSessionId, {
            endTime: new Date().toISOString(),
            focusMinutes: 25, // Đã hoàn thành trọn vẹn
            // Có thể update thêm breakMinutes nếu muốn tính gộp
          });
          console.log("Session updated successfully");
          setCurrentSessionId(null); // Reset ID để lần sau tạo mới
        } catch (error) {
          console.error("Failed to update session", error);
        }
      }
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      addPoints(50); 
      setShowCelebration(true);

      if (newCount % MAX_POMODORO === 0) {
        switchMode('long');
        toast.success("Tuyệt vời! Nghỉ dài hơi nào! 🛋️");
      } else {
        switchMode('short');
        toast.info("Nghỉ ngắn một chút nhé! ☕");
      }
    } else {
      switchMode('focus');
      toast.info("Hết giờ nghỉ, quay lại tập trung nào! 💪");
    }
  };
  const handleSkip = () => {
    setIsActive(false); 

    if (mode === 'focus') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      if (newCount % MAX_POMODORO === 0) {
        switchMode('long');
        toast.info("Đã chuyển nhanh sang: Nghỉ dài 🛋️");
      } else {
        switchMode('short');
        toast.info("Đã chuyển nhanh sang: Nghỉ ngắn ☕");
      }
    } else {
      switchMode('focus');
      toast.info("Đã chuyển nhanh sang: Tập trung 📚");
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    switchMode(mode); 
  };
  const refreshUserData = async () => {
    const freshUser = await authApi.getProfile();
    setUserProgress(prev => ({ ...prev, streak: freshUser.currentStreak }));
}

  const saveProgress = (newProgress: UserProgress) => {
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    setUserProgress(newProgress);
  };
  const calculateLevel = (points: number) => {
    const level = Math.floor(points / 100) + 1;
    const currentLevelPoints = points % 100;
    return { level, currentLevelPoints, pointsToNextLevel: 100 - currentLevelPoints };
  };

  const playSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 523.25; gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  };
  const playSuccessSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  };
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const formatDate = (s?: string) => s && !s.startsWith('0001') ? new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }) : null;

  const getTaskStyle = (status: string) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return { bg: '#E8F5FF', border: '2px solid #3B82F6', badge: 'bg-blue-500', label: 'In Progress', btn: 'Continue' };
      case TaskStatus.COMPLETED: return { bg: '#F0FDF4', border: '2px solid transparent', badge: 'bg-green-500', label: 'Completed', btn: 'Review' };
      default: return { bg: 'white', border: '2px solid transparent', badge: 'bg-yellow-500', label: 'New', btn: 'Start' };
    }
  };

  const getMascotMood = () => {
    if (showCelebration || showTaskComplete) return 'celebrating';
    if (mode !== 'focus') return 'resting'; 
    if (isActive) return 'focused';
    return 'happy';
  };

  const [focusState, setFocusState] = useState<'FOCUSED' | 'DISTRACTED' | 'ABSENT'>('FOCUSED');
  const [distractionWarning, setDistractionWarning] = useState<string | null>(null);

  // Hàm callback xử lý khi AI phát hiện thay đổi
  const handleFocusChange = (status: 'FOCUSED' | 'DISTRACTED' | 'ABSENT', reason?: string) => {
    setFocusState(status);
    
    if (status === 'DISTRACTED' || status === 'ABSENT') {
      setDistractionWarning(reason || 'Mất tập trung');
      // Có thể tạm dừng đồng hồ nếu mất tập trung quá lâu (ví dụ > 5 giây)
    } else {
      setDistractionWarning(null);
    }
  };

  const isDistracted = focusState === 'DISTRACTED' || focusState === 'ABSENT';

  return (
    <motion.div 
      className="h-full transition-colors duration-500 ease-in-out" 
      style={{ background: theme.bg }}
    >
      <div className="flex h-full">
        
        {/* Sidebar */}
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

              {/* Rewards Shop Button & Next Rewards */}
              <motion.div
                className="mb-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => onNavigate?.('rewards-shop')}
                  className="w-full rounded-2xl h-auto py-4"
                  style={{
                    background: 'linear-gradient(135deg, #FFD966 0%, #FFB84D 100%)',
                    color: '#333333',
                    border: '2px solid #FFD966'
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                        <Gift className="w-6 h-6" style={{ color: '#FFD966' }} />
                      </div>
                      <div className="text-left">
                        <p style={{ color: '#333333' }}>Rewards Shop</p>
                        <p className="text-xs" style={{ color: '#666666' }}>Spend your points!</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: '#333333' }} />
                  </div>
                </Button>
              </motion.div>

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

        <motion.div layout className="flex-1 h-full overflow-y-auto min-h-0" ref={scrollContainerRef}>
          <div className="max-w-4xl mx-auto p-6 pb-24">
            
            {/* 6. Header: Tabs chuyển Mode thủ công */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2 bg-white/50 p-1 rounded-full backdrop-blur-sm shadow-sm">
                {(['focus', 'short', 'long'] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      mode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={mode === m ? { color: themes[m].text } : {}}
                  >
                    {themes[m].label}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => { setFocusMode(!focusMode); scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                variant="outline"
                className="rounded-full bg-white/50 border-0 hover:bg-white"
              >
                {focusMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {focusMode ? 'Menu' : 'Focus'}
              </Button>
            </div>

            {/* 7. Khu vực Đồng hồ (Cập nhật Theme) */}
            <motion.div className="mb-8" layout>
              <Card 
                className={`rounded-3xl border-0 relative overflow-hidden transition-all duration-500 gap-1 ${focusMode ? 'p-8' : 'p-6'}`}
                style={{ backgroundColor: 'rgba(247, 244, 238, 0.5)' }}
              >
                {!currentTask && mode === 'focus' && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <p className="text-lg text-gray-500 font-medium">👇 Select a task below to get started!</p>
                  </div>
                )}
                
                <div className="text-center mb-3 relative z-0 flex flex-col items-center">
                  {/* Task Name or Break Label */}
                  {mode === 'focus' && currentTask ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mb-3 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm">
                      {/*<Checkbox checked={false} onCheckedChange={() => handleToggleCheck(currentTask)} className="w-5 h-5" style={{ borderColor: theme.primary }}/>*/}
                      <h2 className={`font-bold text-[#333333] ${focusMode ? 'text-2xl' : 'text-xl'}`}>{currentTask.title}</h2>
                    </motion.div>
                  ) : (
                    <Badge className="mb-4 px-4 py-1.5 text-sm border-0 font-medium" style={{ backgroundColor: theme.secondary, color: theme.text }}>
                      {mode === 'focus' ? '✨ Sẵn sàng?' : (mode === 'short' ? '☕ Short Break' : '🛋️ Long Break')}
                    </Badge>
                  )}
                  
                  {/* Đồng hồ */}
                  <div className="flex justify-center items-center py-3">
                    <div className="relative">
                      <svg width={focusMode ? "280" : "240"} height={focusMode ? "280" : "240"} className="transform -rotate-90 transition-all duration-300">
                        <circle cx={focusMode ? "140" : "120"} cy={focusMode ? "140" : "120"} r={focusMode ? "120" : "100"} stroke="white" strokeWidth="12" fill="none" opacity={0.6}/>
                        <motion.circle
                          cx={focusMode ? "140" : "120"} cy={focusMode ? "140" : "120"} r={focusMode ? "120" : "100"}
                          stroke={theme.primary} // 8. Màu stroke theo theme
                          strokeWidth="12" fill="none" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * (focusMode ? 120 : 100)}
                          animate={{ strokeDashoffset: 2 * Math.PI * (focusMode ? 120 : 100) * (1 - progressValue / 100) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FocusMascot mood={getMascotMood()} size={focusMode ? 140 : 120} />
                      </div>
                    </div>
                  </div>

                  <motion.div 
                    className={`font-bold mt-2 font-mono ${focusMode ? 'text-6xl' : 'text-5xl'}`}
                    style={{ color: theme.text }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>

                  {/* Nút Complete Task 
                  {currentTask && mode === 'focus' && focusMode && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <Button onClick={() => { handleCompleteCurrentTask(); handleToggleCheck(currentTask); }} size="sm" className="rounded-full h-10 px-8 text-lg font-bold bg-green-500 text-white hover:bg-green-600 shadow-xl transition-all">
                        <CheckCircle className="w-6 h-6 mr-2" /> Complete!
                      </Button>
                    </motion.div>
                  )}*/}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 relative z-20 mt-4">
                  

                  <Button
                    onClick={() => { handleToggleTimer(); setFocusMode(!focusMode); }}
                    disabled={mode === 'focus' && !currentTask}
                    size="lg"
                    className={`rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white ${focusMode ? 'px-10 h-16 text-xl' : 'h-14 px-8 text-lg'}`}
                    style={{ backgroundColor: theme.primary }} // 9. Màu nút theo theme
                  >
                    {isActive ? <><Pause className="mr-2"/> Pause</> : <><Play className="mr-2"/> {timeLeft < sessionDuration ? 'Continue' : 'Start'}</>}
                  </Button>
                  
                  {(currentTask || mode !== 'focus') && (
                    <Button
                      onClick={handleSkip}
                      size="lg"
                      variant="outline"
                      className={`rounded-full border-2 bg-white hover:scale-105 transition-all ${focusMode ? 'h-16 w-16' : 'h-14 w-14'}`}
                      style={{ borderColor: theme.primary, color: theme.primary }}
                      title="Bỏ qua, sang bước tiếp theo"
                    >
                      <SkipForward className={focusMode ? "w-8 h-8" : "w-6 h-6"} />
                    </Button>
                  )}

                  {(isActive || timeLeft < sessionDuration) && (
                    <Button
                      onClick={resetTimer}
                      size="lg"
                      variant="outline"
                      className={`rounded-full border-2 bg-white hover:scale-105 transition-all ${focusMode ? 'h-16 w-16' : 'h-14 w-14'}`}
                      style={{ borderColor: theme.primary, color: theme.primary }}
                    >
                      <RotateCcw className={focusMode ? "w-6 h-6" : "w-5 h-5"} />
                    </Button>
                  )}
                  {currentTask && mode === 'focus' && (
                    <Button
                      onClick={() => { handleCompleteCurrentTask(); handleToggleCheck(currentTask); }}
                      size="lg"
                      className={`rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg hover:scale-105 transition-all ${focusMode ? 'px-10 h-16 text-xl' : 'px-8 h-14 text-lg'}`}
                    >
                      <CheckCircle className={`mr-2 ${focusMode ? 'w-6 h-6' : 'w-5 h-5'}`} /> Done
                    </Button>
                  )}

                </div>
              </Card>
            </motion.div>

            {/* Danh sách nhiệm vụ (Chỉ hiện khi không ở Focus Mode VÀ đang ở tab Focus) */}
            <AnimatePresence>
              {!focusMode && mode === 'focus' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6" style={{ color: theme.primary }} />
                    <h2 className="text-xl font-bold" style={{ color: theme.text }}>Task List</h2>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100"><p className="text-gray-400">No tasks for today. Awesome! 🎉</p></div>
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
                            className={`p-4 rounded-2xl transition-all ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                            style={{ backgroundColor: style.bg, border: style.border, borderColor: isSelected ? theme.primary : style.border.split(' ')[2] }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-1 cursor-pointer" onClick={() => selectTaskToFocus(task)}>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`${style.badge} text-white border-0`}>{style.label}</Badge>
                                  {task.dueDate && <span className="text-xs text-gray-500 flex items-center bg-white/60 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3 mr-1"/>{formatDate(task.dueDate)}</span>}
                                </div>
                                <h3 className={`font-bold text-lg ${task.status === TaskStatus.COMPLETED ? 'text-gray-400 line-through' : 'text-[#333333]'}`}>{task.title}</h3>
                                {task.description && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</p>}
                              </div>
                              <div className="flex items-center">
                                {task.status === TaskStatus.COMPLETED ? <CheckCircle className="w-8 h-8 text-green-500 opacity-50" /> : 
                                  <Button size="sm" onClick={() => selectTaskToFocus(task)} className="rounded-full bg-white text-[#333333] border hover:bg-gray-50">{isSelected && isActive ? 'Doing...' : style.btn}</Button>
                                }
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
        </motion.div>
        <div 
        className={`fixed inset-0 z-[9997] pointer-events-none transition-opacity duration-1000 ${
          isDistracted ? 'opacity-100 animate-pulse-subtle' : 'opacity-0'
        }`}
        style={{
          // Sử dụng box-shadow để tạo viền mềm (inset) thay vì border cứng ||| màu mạnh hơn rgba(255, 180, 40, 0.75)
          boxShadow: isDistracted ? 'inset 0 0 60px 20px rgba(255, 200, 60, 0.6)' : 'none'
        }}
        />
        <div className="fixed bottom-4 right-4 z-50 w-48">
          <FocusDetector isFocusMode={mode === 'focus' && isActive} onFocusChange={handleFocusChange} />
          {distractionWarning && (
            <div className="absolute bottom-full mb-2 right-0 bg-red-500 text-white p-2 rounded-lg text-xs shadow-lg animate-bounce">
              ⚠️ {distractionWarning}
            </div>
          )}
      </div>
      </div>

      {/* Confetti & Modal giữ nguyên */}
      <AnimatePresence>
        {showTaskComplete && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100 rounded-3xl p-12 text-center max-w-lg mx-4 relative overflow-hidden shadow-2xl" initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }}>
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-6 relative z-10"><PartyPopper className="w-32 h-32 mx-auto text-[#FFD966] fill-[#FFD966]" /></motion.div>
              <h2 className="text-4xl font-bold text-[#333333] mb-4 relative z-10">Awesome! 🌟</h2>
              <p className="text-xl text-gray-700 mb-8 relative z-10">You have completed the task!</p>
              <Badge className="bg-[#FFD966] text-[#333333] text-2xl px-8 py-3 font-bold shadow-lg">+100 Points</Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowCelebration(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 relative overflow-hidden" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              <div className="absolute inset-0 bg-[#FFD966]/10" />
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 relative z-10"><Sparkles className="w-20 h-20 mx-auto text-[#FFD966] fill-[#FFD966]" /></motion.div>
              <h2 className="text-2xl font-bold text-[#333333] mb-2 relative z-10">Excellent! 🎉</h2>
              <p className="text-gray-600 mb-6 relative z-10">Phiên tập trung hoàn tất.</p>
              <Badge className="bg-[#FFD966] text-[#333333] text-lg px-4 py-1">+50 Points</Badge>
              <p className="text-xs text-gray-400 mt-4 italic animate-pulse">(Bấm phím bất kỳ để tiếp tục)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}