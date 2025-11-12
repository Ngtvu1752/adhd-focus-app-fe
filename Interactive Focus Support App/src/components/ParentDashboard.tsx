import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Calendar, Clock, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface Completion {
  date: string;
  task: string;
  duration: number;
  type: 'focus' | 'break';
}

export function ParentDashboard() {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    thisWeek: 0,
    avgPerDay: 0,
    streak: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const data = JSON.parse(localStorage.getItem('completions') || '[]');
    setCompletions(data);

    const totalSessions = data.length;
    const totalMinutes = data.reduce((sum: number, c: Completion) => sum + c.duration, 0);
    
    // Calculate this week's sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = data.filter((c: Completion) => 
      new Date(c.date) >= oneWeekAgo
    ).length;

    // Calculate average per day (last 7 days)
    const avgPerDay = Math.round(thisWeek / 7);

    // Calculate streak (consecutive days with at least one session)
    let streak = 0;
    const today = new Date();
    const sortedDates = [...new Set(data.map((c: Completion) => 
      new Date(c.date).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (sortedDates[i] === checkDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalSessions,
      totalMinutes,
      thisWeek,
      avgPerDay,
      streak
    });
  };

  const getRecentSessions = () => {
    return completions
      .slice(-10)
      .reverse()
      .map((c, i) => ({
        ...c,
        id: i
      }));
  };

  const getWeeklyData = () => {
    const weekData: { [key: string]: number } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize with 0s
    days.forEach(day => weekData[day] = 0);

    // Count sessions for each day this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    completions.forEach((c: Completion) => {
      const date = new Date(c.date);
      if (date >= oneWeekAgo) {
        const dayName = days[date.getDay()];
        weekData[dayName]++;
      }
    });

    return Object.entries(weekData).map(([day, count]) => ({ day, count }));
  };

  const weeklyData = getWeeklyData();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F7F4EE' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2" style={{ color: '#333333' }}>
            Parent Dashboard
          </h1>
          <p style={{ color: '#666666' }}>
            Track your child's focus and learning progress
          </p>
        </motion.div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#E8F5FF' }}>
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8" style={{ color: '#333333' }} />
                <h3 style={{ color: '#333333' }}>Total Sessions</h3>
              </div>
              <p className="text-4xl" style={{ color: '#333333' }}>
                {stats.totalSessions}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#DFF7E8' }}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8" style={{ color: '#333333' }} />
                <h3 style={{ color: '#333333' }}>Total Time</h3>
              </div>
              <p className="text-4xl" style={{ color: '#333333' }}>
                {stats.totalMinutes}
              </p>
              <p style={{ color: '#666666' }}>minutes</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#FFD966' }}>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8" style={{ color: '#333333' }} />
                <h3 style={{ color: '#333333' }}>This Week</h3>
              </div>
              <p className="text-4xl" style={{ color: '#333333' }}>
                {stats.thisWeek}
              </p>
              <p style={{ color: '#666666' }}>sessions</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-8 h-8" style={{ color: '#333333' }} />
                <h3 style={{ color: '#333333' }}>Day Streak</h3>
              </div>
              <p className="text-4xl" style={{ color: '#333333' }}>
                {stats.streak}
              </p>
              <p style={{ color: '#666666' }}>days 🔥</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6" style={{ color: '#FFD966' }} />
                <h2 style={{ color: '#333333' }}>Weekly Activity</h2>
              </div>
              
              <div className="space-y-4">
                {weeklyData.map((data, index) => (
                  <div key={data.day}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: '#666666' }}>{data.day}</span>
                      <span style={{ color: '#333333' }}>{data.count} sessions</span>
                    </div>
                    <motion.div
                      className="h-8 rounded-full"
                      style={{ backgroundColor: '#E8F5FF' }}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#FFD966' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6" style={{ color: '#DFF7E8' }} />
                <h2 style={{ color: '#333333' }}>Recent Sessions</h2>
              </div>

              {completions.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: '#666666' }}>No sessions completed yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getRecentSessions().map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: '#F7F4EE' }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="mb-1" style={{ color: '#333333' }}>
                            {session.task}
                          </p>
                          <p className="text-sm" style={{ color: '#666666' }}>
                            {new Date(session.date).toLocaleDateString()} at{' '}
                            {new Date(session.date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div 
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: '#DFF7E8', color: '#333333' }}
                        >
                          {session.duration} min
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#E8F5FF' }}>
            <h2 className="mb-4" style={{ color: '#333333' }}>
              Performance Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="mb-2" style={{ color: '#666666' }}>
                  Average Daily Sessions
                </p>
                <p className="text-3xl" style={{ color: '#333333' }}>
                  {stats.avgPerDay}
                </p>
              </div>
              <div>
                <p className="mb-2" style={{ color: '#666666' }}>
                  Completion Rate
                </p>
                <p className="text-3xl" style={{ color: '#333333' }}>
                  {stats.totalSessions > 0 ? '100%' : '0%'}
                </p>
              </div>
              <div>
                <p className="mb-2" style={{ color: '#666666' }}>
                  Average Session Length
                </p>
                <p className="text-3xl" style={{ color: '#333333' }}>
                  {stats.totalSessions > 0 
                    ? Math.round(stats.totalMinutes / stats.totalSessions)
                    : 0} min
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
