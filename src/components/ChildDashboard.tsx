import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Trophy, Target, Star, Play,Clock,  CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { FocusMascot } from './FocusMascot';

import taskApi, { Task, TaskStatus } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';

interface ChildDashboardProps {
  onStartTask?: (task: Task) => void;
}

export function ChildDashboard({ onStartTask }: ChildDashboardProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);
  console.log('Child Dashboard User:', user); 
  
  const loadData = async () => {
    try {
      const data = await taskApi.getTasksByChildId(user!.id!);
      console.log('Tasks fetched for child:', data);
      const taskList = Array.isArray(data) ? data : (data as any).data || [];
      const sortTasks = taskList.sort((a : any, b : any) => {
        const priority = { [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.TODO]: 2, [TaskStatus.COMPLETED]: 3 };
        return (priority[a.status as TaskStatus] || 2) - (priority[b.status as TaskStatus] || 2);
      })
      setTasks(sortTasks);
      const completed = taskList.filter((t: Task) => t.status === TaskStatus.COMPLETED);
      setTotalStars(completed.length);
      setCompletedToday(completed.length);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };


  const handleStartTask = (task: Task) => {
    if (onStartTask) {
      onStartTask(task);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString || isoString.startsWith('0001')) return null; // Bỏ qua ngày mặc định vô nghĩa
    return new Date(isoString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };
  const getTaskStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return {
          bg: '#E8F5FF', // Xanh nhạt
          border: '2px solid #3B82F6',
          badge: 'bg-blue-500',
          label: 'Đang làm dở',
          btnText: 'Tiếp tục',
          icon: <RotateCcw className="w-4 h-4 mr-2" />
        };
      case 'COMPLETED':
        return {
          bg: '#F0FDF4', // Xanh lá nhạt
          border: '2px solid transparent',
          badge: 'bg-green-500',
          label: 'Đã xong',
          btnText: 'Làm lại',
          icon: <CheckCircle className="w-4 h-4 mr-2" />
        };
      default: // TODO
        return {
          bg: 'white',
          border: '2px solid transparent',
          badge: 'bg-yellow-500',
          label: 'Mới',
          btnText: 'Bắt đầu',
          icon: <Play className="w-4 h-4 mr-2" />
        };
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
            {greeting()}, {user?.name || 'Thawngf lol'} 🌟
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
          <Card className="p-6 rounded-3xl border-0" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8" style={{ color: '#FFD966' }} />
              <h2 className="text-xl font-bold" style={{ color: '#333333' }}>Today's Tasks</h2>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-2" style={{ color: '#333333' }}>
                  No tasks yet! 📝
                </p>
                <p style={{ color: '#666666' }}>
                  Take a break or remind your parents to assign some tasks.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => {
                  const style = getTaskStyle(task.status);
                  const formattedDate = formatDate(task.dueDate);

                  return (
                    <motion.div
                      key={task.id}
                      className="rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                      style={{ 
                        backgroundColor: style.bg,
                        border: style.border
                      }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Thông tin Task */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${style.badge} text-white hover:${style.badge} border-0`}>
                            {style.label}
                          </Badge>
                          {formattedDate && (
                            <span className="flex items-center text-xs text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 mr-1" />
                              Hạn: {formattedDate}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-[#333333] mb-1">
                          {task.title}
                        </h3>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Nút hành động */}
                      <Button
                        onClick={() => handleStartTask(task)}
                        disabled={task.status === 'COMPLETED'} // Có thể disable nếu đã xong
                        size="lg"
                        className="rounded-full shadow-md min-w-[140px]"
                        style={{ 
                          backgroundColor: task.status === 'COMPLETED' ? '#E5E7EB' : '#FFD966',
                          color: task.status === 'COMPLETED' ? '#9CA3AF' : '#333333'
                        }}
                      >
                        {style.icon}
                        {style.btnText}
                      </Button>
                    </motion.div>
                  );
                })}
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
