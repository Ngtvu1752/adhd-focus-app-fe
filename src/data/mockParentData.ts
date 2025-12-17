// src/data/mockParentData.ts

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  level: number;
  currentRank: string; // Vd: "Thợ săn kiến thức"
  totalPoints: number;
  currentStreak: number; // Chuỗi ngày học liên tiếp
  nextLevelPoints: number; // Điểm cần để lên cấp tiếp theo
}

export interface WeeklyFocusStat {
  day: string;       // "T2", "T3",...
  focusTime: number; // Phút tập trung
  distractedTime: number; // Phút mất tập trung
}

export interface RecentSession {
  id: string;
  taskTitle: string;
  startTime: string; // ISO String
  duration: number; // Phút
  focusScore: number; // 0-100%
  status: 'COMPLETED' | 'ABORTED' | 'PAUSED';
  distractionCount: number; // Số lần bị nhắc nhở
  aiNotes?: string[]; // Ghi chú từ AI (vd: "Hay quay đầu sang trái")
}

export interface AssignedTask {
  id: string;
  title: string;
  subject: string; // Toán, Văn, Anh...
  deadline: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  pointsReward: number;
}

export interface ParentDashboardData {
  childInfo: ChildProfile;
  weeklyStats: WeeklyFocusStat[];
  recentSessions: RecentSession[];
  todayTasks: AssignedTask[];
  insights: {
    mostDistractedTime: string; // Vd: "14:00 - 15:00"
    bestSubject: string;
    improvementTip: string;
  };
}

export const MOCK_PARENT_DATA: ParentDashboardData = {
  // 1. THÔNG TIN BÉ
  childInfo: {
    id: "child_001",
    name: "Minh Anh",
    age: 10,
    avatarUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=MinhAnh", // Avatar ngẫu nhiên
    level: 5,
    currentRank: "Phi hành gia Tập trung 🚀",
    totalPoints: 1250,
    nextLevelPoints: 1500,
    currentStreak: 4, // Đã học 4 ngày liên tiếp
  },

  // 2. BIỂU ĐỒ TẬP TRUNG TUẦN NÀY
  weeklyStats: [
    { day: "T2", focusTime: 45, distractedTime: 10 },
    { day: "T3", focusTime: 60, distractedTime: 5 },
    { day: "T4", focusTime: 30, distractedTime: 15 },
    { day: "T5", focusTime: 55, distractedTime: 8 },
    { day: "T6", focusTime: 0, distractedTime: 0 }, // Chưa học
    { day: "T7", focusTime: 0, distractedTime: 0 },
    { day: "CN", focusTime: 0, distractedTime: 0 },
  ],

  // 3. CÁC PHIÊN HỌC GẦN ĐÂY (Kết quả từ FocusDetector)
  recentSessions: [
    {
      id: "sess_01",
      taskTitle: "Làm bài tập Toán lớp 5",
      startTime: "2023-10-26T09:00:00",
      duration: 25,
      focusScore: 88, // Rất tốt
      status: 'COMPLETED',
      distractionCount: 2,
      aiNotes: ["Bé hơi cúi đầu quá thấp lúc 10 phút đầu", "Tập trung rất tốt đoạn giữa"]
    },
    {
      id: "sess_02",
      taskTitle: "Học từ vựng Tiếng Anh",
      startTime: "2023-10-26T14:30:00",
      duration: 15,
      focusScore: 65, // Trung bình
      status: 'ABORTED', // Dừng giữa chừng
      distractionCount: 5,
      aiNotes: ["Quay đầu sang trái nhiều lần", "Mắt không nhìn màn hình liên tục"]
    },
    {
      id: "sess_03",
      taskTitle: "Đọc truyện Dế Mèn",
      startTime: "2023-10-25T20:00:00",
      duration: 20,
      focusScore: 95, // Xuất sắc
      status: 'COMPLETED',
      distractionCount: 0,
      aiNotes: ["Tư thế ngồi chuẩn", "Không có dấu hiệu xao nhãng"]
    }
  ],

  // 4. DANH SÁCH NHIỆM VỤ HÔM NAY
  todayTasks: [
    {
      id: "task_1",
      title: "Giải 5 bài toán đố",
      subject: "Toán",
      deadline: "2023-10-26T17:00:00",
      status: 'COMPLETED',
      pointsReward: 50
    },
    {
      id: "task_2",
      title: "Viết đoạn văn tả con mèo",
      subject: "Tiếng Việt",
      deadline: "2023-10-26T20:00:00",
      status: 'IN_PROGRESS',
      pointsReward: 100
    },
    {
      id: "task_3",
      title: "Nghe audio bài Unit 3",
      subject: "Tiếng Anh",
      deadline: "2023-10-27T08:00:00",
      status: 'TODO',
      pointsReward: 30
    }
  ],

  // 5. GÓC NHÌN SÂU (INSIGHTS) - Gợi ý cho phụ huynh
  insights: {
    mostDistractedTime: "14:00 - 15:00", // Giờ hay buồn ngủ
    bestSubject: "Toán học",
    improvementTip: "Minh Anh thường mất tập trung khi học Tiếng Anh. Mẹ thử dùng phần thưởng nhỏ để khích lệ bé nhé!"
  }
};


