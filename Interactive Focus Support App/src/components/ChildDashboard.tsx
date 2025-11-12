import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Trophy, Target, Star, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { FocusMascot } from './FocusMascot';

interface Task {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface ChildDashboardProps {
  onStartTask?: (task: Task) => void;
}

export function ChildDashboard({ onStartTask }: ChildDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);

    // Load completions
    const completions = JSON.parse(localStorage.getItem('completions') || '[]');
    const today = new Date().toDateString();
    const todayCompletions = completions.filter((c: any) => 
      new Date(c.date).toDateString() === today
    );
    setCompletedToday(todayCompletions.length);
    setTotalStars(completions.length);
  }, []);

  const handleStartTask = (task: Task) => {
    if (onStartTask) {
      onStartTask(task);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #E8F5FF 0%, #DFF7E8 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2" style={{ color: '#333333' }}>
            {greeting()}, Superstar! 🌟
          </h1>
          <p className="text-xl" style={{ color: '#333333' }}>
            Ready to focus and learn?
          </p>
        </motion.div>

        {/* Mascot */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <FocusMascot mood="happy" size={120} />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 text-center rounded-2xl border-0" style={{ backgroundColor: '#FFD966' }}>
              <Trophy className="w-12 h-12 mx-auto mb-2" style={{ color: '#333333' }} />
              <p className="text-3xl mb-1" style={{ color: '#333333' }}>{totalStars}</p>
              <p style={{ color: '#333333' }}>Total Stars</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 text-center rounded-2xl border-0" style={{ backgroundColor: '#DFF7E8' }}>
              <Star className="w-12 h-12 mx-auto mb-2" style={{ color: '#333333', fill: '#333333' }} />
              <p className="text-3xl mb-1" style={{ color: '#333333' }}>{completedToday}</p>
              <p style={{ color: '#333333' }}>Done Today</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 text-center rounded-2xl border-0" style={{ backgroundColor: '#F7F4EE' }}>
              <Target className="w-12 h-12 mx-auto mb-2" style={{ color: '#333333' }} />
              <p className="text-3xl mb-1" style={{ color: '#333333' }}>{tasks.length}</p>
              <p style={{ color: '#333333' }}>Tasks Ready</p>
            </Card>
          </motion.div>
        </div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 rounded-3xl border-0" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8" style={{ color: '#FFD966' }} />
              <h2 style={{ color: '#333333' }}>Today's Tasks</h2>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-2" style={{ color: '#333333' }}>
                  No tasks yet! 📝
                </p>
                <p style={{ color: '#666666' }}>
                  Ask your parent to add some tasks for you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className="rounded-2xl p-4 flex items-center justify-between"
                    style={{ backgroundColor: '#E8F5FF' }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <h3 className="mb-2" style={{ color: '#333333' }}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: '#666666' }}>
                          ⏱️ {task.duration} minutes
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartTask(task)}
                      size="lg"
                      className="rounded-full"
                      style={{ 
                        backgroundColor: '#FFD966',
                        color: '#333333'
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Daily Progress */}
        <motion.div
          className="mt-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 rounded-3xl border-0" style={{ backgroundColor: '#F7F4EE' }}>
            <h3 className="mb-4 text-center" style={{ color: '#333333' }}>
              Today's Progress 🎯
            </h3>
            <div className="mb-2">
              <Progress 
                value={(completedToday / Math.max(tasks.length, 1)) * 100} 
                className="h-4"
              />
            </div>
            <p className="text-center" style={{ color: '#666666' }}>
              {completedToday} of {tasks.length} tasks completed
            </p>
          </Card>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          className="mt-6 text-center p-6 rounded-2xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xl" style={{ color: '#333333' }}>
            💪 You can do it! Every star you earn makes you smarter! ⭐
          </p>
        </motion.div>
      </div>
    </div>
  );
}
