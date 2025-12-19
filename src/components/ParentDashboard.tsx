import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChildManagement } from './ChildManagement';
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Card } from "./ui/card";

interface Completion {
  date: string;
  task: string;
  duration: number;
  type: "focus" | "break";
}

// Mock data riêng cho từng trẻ
const mockDataChild1: Completion[] = [
  { date: new Date(Date.now() - 86400000 * 1).toISOString(), task: "Toán học vui", duration: 25, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 2).toISOString(), task: "Đọc truyện", duration: 30, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 3).toISOString(), task: "Vẽ tranh", duration: 45, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 4).toISOString(), task: "Học tiếng Anh", duration: 20, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 5).toISOString(), task: "Lắp ráp Lego", duration: 60, type: "break" },
];

const mockDataChild2: Completion[] = [
  { date: new Date(Date.now() - 86400000 * 1).toISOString(), task: "Tập viết", duration: 15, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 2).toISOString(), task: "Học hát", duration: 20, type: "focus" },
  { date: new Date(Date.now() - 86400000 * 3).toISOString(), task: "Xem hoạt hình", duration: 30, type: "break" },
];

const mockTasks = [
  "Math practice",
  "Reading adventure",
  "Science quiz",
  "Coding mini project",
  "Creative writing",
  "Art project",
  "Focus session",
];

const createMockCompletions = (): Completion[] => {
  const now = new Date();
  const completions: Completion[] = [];

  // Keep a visible streak for the last five days
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    completions.push({
      date: new Date(date.setHours(9 + i, 15)).toISOString(),
      task: mockTasks[i % mockTasks.length],
      duration: 20 + (i % 3) * 5,
      type: "focus",
    });
  }

  // Add variety for the prior week
  for (let d = 5; d < 12; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    completions.push({
      date: new Date(date.setHours(10 + (d % 3) * 2, 30)).toISOString(),
      task: mockTasks[d % mockTasks.length],
      duration: 15 + (d % 4) * 5,
      type: d % 3 === 0 ? "break" : "focus",
    });
  }

  return completions;
};

export function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    thisWeek: 0,
    avgPerDay: 0,
    streak: 0,
  });

  useEffect(() => {
    loadStats();
  }, [selectedChild]); // Reload khi chọn trẻ khác

  const loadStats = () => {
    let data: Completion[] = [];

    if (selectedChild) {
      // Nếu đã chọn trẻ, dùng mock data tương ứng
      if (selectedChild.id === 'child1') {
        data = mockDataChild1;
      } else if (selectedChild.id === 'child2') {
        data = mockDataChild2;
      } else {
        // Fallback nếu id không khớp
        data = createMockCompletions();
      }
    } else {
      // Mặc định lấy từ localStorage hoặc tạo mới
      data = JSON.parse(localStorage.getItem("completions") || "[]");
      if (!data.length) {
        data = createMockCompletions();
        localStorage.setItem("completions", JSON.stringify(data));
      }
    }

    setCompletions(data);

    const totalSessions = data.length;
    const totalMinutes = data.reduce(
      (sum: number, c: Completion) => sum + c.duration,
      0
    );

    // --- This week's sessions ---
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = data.filter(
      (c: Completion) => new Date(c.date) >= oneWeekAgo
    ).length;

    // --- Average per day ---
    const avgPerDay = Math.round(thisWeek / 7);

    // --- Calculate streak ---
    let streak = 0;
    const today = new Date();

    // ✅ FIXED: ensure `a` and `b` are typed as string
    const sortedDates = [...new Set(data.map((c) => new Date(c.date).toDateString()))]
      .sort(
        (a: string, b: string) =>
          new Date(b).getTime() - new Date(a).getTime()
      );

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
      streak,
    });
  };

  const getRecentSessions = () => {
    return completions.slice(-10).reverse().map((c, i) => ({
      ...c,
      id: i,
    }));
  };

  const getWeeklyData = () => {
    const weekData: { [key: string]: number } = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((day) => (weekData[day] = 0));

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

  const getWeeklyFocusTime = () => {
    const weekData: { [key: string]: number } = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((day) => (weekData[day] = 0));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    completions.forEach((c: Completion) => {
      const date = new Date(c.date);
      if (date >= oneWeekAgo) {
        const dayName = days[date.getDay()];
        weekData[dayName] += c.duration;
      }
    });

    return Object.entries(weekData).map(([day, minutes]) => ({ day, minutes }));
  };

  const weeklyData = getWeeklyData();
  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  const weeklyFocusTime = getWeeklyFocusTime();
  const maxFocusTime = Math.max(...weeklyFocusTime.map((d) => d.minutes), 1);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F7F4EE" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 flex justify-between items-end"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="mb-2" style={{ color: "#333333" }}>
              {selectedChild ? `Bảng điều khiển của ${selectedChild.firstName}` : "Bảng điều khiển phụ huynh"}
            </h1>
            <p style={{ color: "#666666" }}>
              {selectedChild 
                ? "Xem chi tiết hoạt động của bé" 
                : "Theo dõi sự tập trung và tiến độ học tập của con"}
            </p>
          </div>
          {selectedChild && (
            <button 
              onClick={() => setSelectedChild(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Quay lại tổng quan
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Tổng số phiên",
              icon: Award,
              value: stats.totalSessions,
              bg: "#E8F5FF",
              suffix: "phiên",
            },
            {
              label: "Tổng thời gian",
              icon: Clock,
              value: stats.totalMinutes,
              bg: "#DFF7E8",
              suffix: "phút",
            },
            {
              label: "Tuần này",
              icon: TrendingUp,
              value: stats.thisWeek,
              bg: "#FFD966",
              suffix: "phiên",
            },
            {
              label: "Chuỗi ngày",
              icon: Calendar,
              value: stats.streak,
              bg: "white",
              suffix: "ngày 🔥",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
            >
              <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: item.bg }}>
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-8 h-8" style={{ color: "#333333" }} />
                  <h3 style={{ color: "#333333" }}>{item.label}</h3>
                </div>
                <p className="text-4xl" style={{ color: "#333333" }}>
                  {item.value}
                </p>
                {item.suffix && <p style={{ color: "#666666" }}>{item.suffix}</p>}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Activity & Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: "white" }}>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6" style={{ color: "#FFD966" }} />
                <h2 style={{ color: "#333333" }}>Hoạt động tuần</h2>
              </div>

              <div className="space-y-4">
                {weeklyData.map((data, index) => (
                  <div key={data.day}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "#666666" }}>{data.day}</span>
                      <span style={{ color: "#333333" }}>{data.count} sessions</span>
                    </div>
                    <motion.div
                      className="h-8 rounded-full"
                      style={{ backgroundColor: "#E8F5FF" }}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: "#FFD966" }}
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
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: "white" }}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6" style={{ color: "#DFF7E8" }} />
                <h2 style={{ color: "#333333" }}>Các phiên gần đây</h2>
              </div>

              {completions.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: "#666666" }}>No sessions completed yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getRecentSessions().map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: "#F7F4EE" }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="mb-1" style={{ color: "#333333" }}>
                            {session.task}
                          </p>
                          <p className="text-sm" style={{ color: "#666666" }}>
                            {new Date(session.date).toLocaleDateString()} at{" "}
                            {new Date(session.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: "#DFF7E8", color: "#333333" }}
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

        {/* Focus Time Chart */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: "white" }}>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6" style={{ color: "#4ADE80" }} />
              <h2 style={{ color: "#333333" }}>Thời gian tập trung tuần này (phút)</h2>
            </div>

            <div className="space-y-4">
              {weeklyFocusTime.map((data, index) => (
                <div key={data.day}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: "#666666" }}>{data.day}</span>
                    <span style={{ color: "#333333" }}>{data.minutes} phút</span>
                  </div>
                  <motion.div
                    className="h-8 rounded-full"
                    style={{ backgroundColor: "#E8F5FF" }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#4ADE80" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.minutes / maxFocusTime) * 100}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Insights */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: "#E8F5FF" }}>
            <h2 className="mb-4" style={{ color: "#333333" }}>
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="mb-2" style={{ color: "#666666" }}>
                  Trung bình phiên mỗi ngày
                </p>
                <p className="text-3xl" style={{ color: "#333333" }}>
                  {stats.avgPerDay}
                </p>
              </div>
              <div>
                <p className="mb-2" style={{ color: "#666666" }}>
                  Completion Rate
                </p>
                <p className="text-3xl" style={{ color: "#333333" }}>
                  {stats.totalSessions > 0 ? "100%" : "0%"}
                </p>
              </div>
              <div>
                <p className="mb-2" style={{ color: "#666666" }}>
                  Average Session Length
                </p>
                <p className="text-3xl" style={{ color: "#333333" }}>
                  {stats.totalSessions > 0
                    ? Math.round(stats.totalMinutes / stats.totalSessions)
                    : 0}{" "}
                  min
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ChildManagement onSelectChild={setSelectedChild} />
        </motion.div>
      </div>
    </div>
  );
}
