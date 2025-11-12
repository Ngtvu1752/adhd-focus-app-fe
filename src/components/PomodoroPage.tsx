import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Star, Award, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { FocusMascot } from './FocusMascot';

interface PomodoroPageProps {
  currentTask?: { id: string; title: string; duration: number };
  onComplete?: () => void;
}

export function PomodoroPage({ currentTask, onComplete }: PomodoroPageProps) {
  const defaultDuration = currentTask?.duration || 25;
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = isBreak ? 5 * 60 : defaultDuration * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

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

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (!isBreak) {
      // Focus session completed
      setShowCelebration(true);
      setStarsEarned((prev) => prev + 1);
      
      // Save completion to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]');
      completions.push({
        date: new Date().toISOString(),
        task: currentTask?.title || 'Focus Session',
        duration: defaultDuration,
        type: 'focus'
      });
      localStorage.setItem('completions', JSON.stringify(completions));
      
      setTimeout(() => {
        setShowCelebration(false);
        setIsBreak(true);
        setTimeLeft(5 * 60);
      }, 3000);
    } else {
      // Break completed
      setIsBreak(false);
      setTimeLeft(defaultDuration * 60);
      if (onComplete) onComplete();
    }
  };

  const playSound = () => {
    // Create a simple success sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 523.25; // C5
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : defaultDuration * 60);
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

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #E8F5FF 0%, #DFF7E8 100%)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-8 h-8" style={{ color: '#FFD966', fill: '#FFD966' }} />
            <h1 style={{ color: '#333333' }}>Focus Time!</h1>
            <Star className="w-8 h-8" style={{ color: '#FFD966', fill: '#FFD966' }} />
          </div>
          {currentTask && (
            <motion.p 
              className="text-xl"
              style={{ color: '#333333' }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {currentTask.title}
            </motion.p>
          )}
        </motion.div>

        {/* Main Timer Card */}
        <motion.div
          className="rounded-3xl p-8 shadow-lg mb-6"
          style={{ backgroundColor: '#F7F4EE' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Mascot */}
          <div className="flex justify-center mb-6">
            <FocusMascot mood={getMascotMood()} size={150} />
          </div>

          {/* Status */}
          <motion.div 
            className="text-center mb-6"
            animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
          >
            <div 
              className="inline-block px-6 py-2 rounded-full mb-4"
              style={{ backgroundColor: isBreak ? '#DFF7E8' : '#FFD966' }}
            >
              <p style={{ color: '#333333' }}>
                {isBreak ? '🌟 Break Time!' : '📚 Focus Time'}
              </p>
            </div>
          </motion.div>

          {/* Timer Display */}
          <motion.div 
            className="text-center mb-6"
            animate={{ scale: timeLeft <= 10 && timeLeft > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: timeLeft <= 10 && timeLeft > 0 ? Infinity : 0, duration: 0.5 }}
          >
            <div className="relative inline-block">
              <svg width="280" height="280" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="#E8F5FF"
                  strokeWidth="20"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke={isBreak ? '#DFF7E8' : '#FFD966'}
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl" style={{ color: '#333333' }}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </motion.div>

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
        </motion.div>

        {/* Stars Earned */}
        <motion.div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'white' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award className="w-6 h-6" style={{ color: '#FFD966' }} />
            <h3 style={{ color: '#333333' }}>Stars Earned Today</h3>
          </div>
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: i < starsEarned ? 1 : 0.5, rotate: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              >
                <Star
                  className="w-10 h-10"
                  style={{ 
                    color: '#FFD966',
                    fill: i < starsEarned ? '#FFD966' : 'none'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

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
                <p className="text-xl mb-6" style={{ color: '#333333' }}>
                  You earned a star! ⭐
                </p>
                <p style={{ color: '#333333' }}>
                  Time for a quick break!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
