import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Star, Award, Sparkles, Eye, EyeOff, Trophy, Zap, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { FocusMascot } from './FocusMascot';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  totalSessions: number;
  streak: number;
}

export function MainChildInterface() {
  // Task and Timer State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
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

  const currentTask = tasks[currentTaskIndex];
  const totalDuration = isBreak ? 5 * 60 : (currentTask?.duration || 25) * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    loadTasks();
    loadProgress();
  }, []);

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

  const loadTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  };

  const saveProgress = (newProgress: UserProgress) => {
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    setUserProgress(newProgress);
  };

  const calculateLevel = (totalPoints: number) => {
    const level = Math.floor(totalPoints / 100) + 1;
    const currentLevelPoints = totalPoints % 100;
    const pointsToNextLevel = 100 - currentLevelPoints;
    return { level, currentLevelPoints, pointsToNextLevel };
  };

  const addPoints = (points: number) => {
    const newTotalPoints = userProgress.totalPoints + points;
    const levelInfo = calculateLevel(newTotalPoints);
    
    const newProgress = {
      ...userProgress,
      totalPoints: newTotalPoints,
      level: levelInfo.level,
      currentLevelPoints: levelInfo.currentLevelPoints,
      pointsToNextLevel: levelInfo.pointsToNextLevel,
      totalSessions: userProgress.totalSessions + 1
    };

    // Check for level up
    if (levelInfo.level > userProgress.level) {
      toast.success(`🎉 Level Up! You're now Level ${levelInfo.level}!`);
    }

    saveProgress(newProgress);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (!isBreak) {
      // Focus session completed
      setShowCelebration(true);
      addPoints(50); // Award 50 points for completing a session
      
      // Save completion to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]');
      completions.push({
        date: new Date().toISOString(),
        task: currentTask?.title || 'Focus Session',
        duration: currentTask?.duration || 25,
        type: 'focus'
      });
      localStorage.setItem('completions', JSON.stringify(completions));
      
      setTimeout(() => {
        setShowCelebration(false);
        setIsBreak(true);
        setTimeLeft(5 * 60);
        toast.success('Great job! Time for a 5-minute break! 🌟');
      }, 3000);
    } else {
      // Break completed
      setIsBreak(false);
      // Move to next task if available
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
        setTimeLeft((tasks[currentTaskIndex + 1]?.duration || 25) * 60);
        toast.success('Break done! Ready for the next task? 💪');
      } else {
        setTimeLeft((currentTask?.duration || 25) * 60);
        toast.success('Break done! Great work today! 🎉');
      }
    }
  };

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 523.25;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    if (!currentTask && !isBreak) {
      toast.error('Please select a task first!');
      return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : (currentTask?.duration || 25) * 60);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      toast.success('Focus Mode activated! Minimize distractions 🎯');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMascotMood = () => {
    if (showCelebration) return 'celebrating';
    if (isBreak) return 'resting';
    if (isActive) return 'focused';
    return 'happy';
  };

  const selectTask = (index: number) => {
    if (!isActive) {
      setCurrentTaskIndex(index);
      setTimeLeft(tasks[index].duration * 60);
      setIsBreak(false);
    }
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

        {/* Main Interaction Space */}
        <div className="flex-1 h-full overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto p-6 pb-24">
            {/* Focus Mode Toggle */}
            <motion.div
              className="flex justify-end mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={toggleFocusMode}
                variant="outline"
                className="rounded-full"
                style={{
                  backgroundColor: focusMode ? '#FFD966' : 'white',
                  color: '#333333',
                  borderColor: focusMode ? '#FFD966' : '#ddd'
                }}
              >
                {focusMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              </Button>
            </motion.div>

            {/* Task Display Area */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rounded-3xl border-0" style={{ backgroundColor: 'white' }}>
                {currentTask ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: isBreak ? '#DFF7E8' : '#FFD966' }}
                      >
                        <span className="text-2xl">{isBreak ? '☕' : '📚'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#666666' }}>
                          {isBreak ? 'Break Time' : 'Current Task'}
                        </p>
                        <h2 style={{ color: '#333333' }}>
                          {isBreak ? 'Take a rest!' : currentTask.title}
                        </h2>
                      </div>
                    </div>

                    {!isBreak && (
                      <div 
                        className="p-6 rounded-2xl mb-6"
                        style={{ backgroundColor: '#F7F4EE' }}
                      >
                        <p className="text-center text-xl" style={{ color: '#333333' }}>
                          Focus on your task! You've got this! 💪
                        </p>
                      </div>
                    )}

                    {isBreak && (
                      <div 
                        className="p-6 rounded-2xl mb-6"
                        style={{ backgroundColor: '#DFF7E8' }}
                      >
                        <p className="text-center text-xl" style={{ color: '#333333' }}>
                          Great work! Relax and recharge! 🌟
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xl mb-4" style={{ color: '#333333' }}>
                      No task selected
                    </p>
                    <p style={{ color: '#666666' }}>
                      Choose a task below to get started!
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Integrated Timer */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 rounded-3xl border-0" style={{ backgroundColor: '#F7F4EE' }}>
                {/* Mascot */}
                <div className="flex justify-center mb-6">
                  <FocusMascot mood={getMascotMood()} size={focusMode ? 100 : 140} />
                </div>

                {/* Timer Display */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg width={focusMode ? "200" : "280"} height={focusMode ? "200" : "280"} className="transform -rotate-90">
                      <circle
                        cx={focusMode ? "100" : "140"}
                        cy={focusMode ? "100" : "140"}
                        r={focusMode ? "85" : "120"}
                        stroke="#E8F5FF"
                        strokeWidth={focusMode ? "12" : "20"}
                        fill="none"
                      />
                      <motion.circle
                        cx={focusMode ? "100" : "140"}
                        cy={focusMode ? "100" : "140"}
                        r={focusMode ? "85" : "120"}
                        stroke={isBreak ? '#DFF7E8' : '#FFD966'}
                        strokeWidth={focusMode ? "12" : "20"}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * (focusMode ? 85 : 120)}
                        strokeDashoffset={2 * Math.PI * (focusMode ? 85 : 120) * (1 - progress / 100)}
                        animate={{ strokeDashoffset: 2 * Math.PI * (focusMode ? 85 : 120) * (1 - progress / 100) }}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={focusMode ? "text-4xl" : "text-6xl"} style={{ color: '#333333' }}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="rounded-full h-16 px-8"
                    style={{ 
                      backgroundColor: '#FFD966',
                      color: '#333333'
                    }}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="rounded-full h-16 px-8"
                    style={{ 
                      borderColor: '#333333',
                      color: '#333333'
                    }}
                  >
                    <RotateCcw className="w-6 h-6 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Subtle Progress Indicator - Always Visible in Focus Mode */}
                {focusMode && (
                  <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>
                      Session Progress
                    </p>
                    <Progress value={progress} className="h-2" />
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Task List - Hidden in Focus Mode */}
            <AnimatePresence>
              {!focusMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card className="p-6 rounded-3xl border-0" style={{ backgroundColor: 'white' }}>
                    <h3 className="mb-4" style={{ color: '#333333' }}>
                      Available Tasks
                    </h3>

                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p style={{ color: '#666666' }}>
                          Ask your parent to add some tasks for you! 📝
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            onClick={() => selectTask(index)}
                            className="rounded-xl p-4 cursor-pointer transition-all"
                            style={{ 
                              backgroundColor: currentTaskIndex === index ? '#E8F5FF' : '#F7F4EE',
                              border: currentTaskIndex === index ? '2px solid #FFD966' : '2px solid transparent'
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 style={{ color: '#333333' }}>{task.title}</h4>
                                <p className="text-sm" style={{ color: '#666666' }}>
                                  ⏱️ {task.duration} minutes
                                </p>
                              </div>
                              {currentTaskIndex === index && (
                                <ChevronRight className="w-6 h-6" style={{ color: '#FFD966' }} />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-3xl p-12 text-center max-w-md mx-4"
              style={{ backgroundColor: '#F7F4EE' }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Sparkles className="w-20 h-20 mx-auto mb-4" style={{ color: '#FFD966' }} />
              </motion.div>
              <h2 className="mb-4" style={{ color: '#333333' }}>
                Amazing Work! 🎉
              </h2>
              <p className="text-xl mb-2" style={{ color: '#333333' }}>
                +50 Points! ⭐
              </p>
              <p className="text-xl mb-6" style={{ color: '#333333' }}>
                You're doing great!
              </p>
              <p style={{ color: '#333333' }}>
                Time for a quick break!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
