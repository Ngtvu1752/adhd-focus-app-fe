import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Settings, User, Baby, LogOut, UserCircle, Smile } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MainChildInterface } from '../components/MainChildInterface';
import { ParentDashboard } from '../components/ParentDashboard';
import { TaskSettings } from '../components/TaskSettings';
import { KidProfileSettings } from '../components/KidProfileSettings';
import { Toaster } from '../components/ui/sonner';
import { RewardsShop } from '../components/RewardsShop';

import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { AVATAR_OPTIONS } from '../constrants/kidProfileData';

import pomodoroLogo from "../assets/pomodoro-logo.png";

type Page = 'parent-dashboard' | 'settings' | 'child-home' | 'kid-profile' | 'mascot-showcase' | 'rewards-shop';
type UserMode = 'child' | 'parent';
const getInitials = (name: string | undefined) => {
  if (!name) return "U"; // User
  return name.substring(0, 2).toUpperCase();
};
export default function MainFocusApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState<UserMode>('child');
  //const [currentPage, setCurrentPage] = useState<Page>('child');
  const [currentPage, setCurrentPage] = useState<Page>('parent-dashboard');
  const [displayProfile, setDisplayProfile] = useState({
    name: user?.firstName || "Bé ngoan",
    avatarEmoji: null as string | null,
    avatarColor: '#FFD966' // Màu mặc định
  });

  const getUserName = () => user?.username || "Người dùng";
  const getUserInitials = () => ( user?.username || "U").substring(0, 2).toUpperCase();
  const handleLogout = () => {
    logout();
    navigate('/login'); // Điều hướng về trang login
  };

  const handleChildNavigate = (target: string) => {
    if (target === 'rewards-shop') {
      setCurrentPage('rewards-shop');
    } else {
      setCurrentPage('child-home');
    }
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const renderPage = () => {
    if (user?.role === 'parent') {
      switch (currentPage) {
        case 'parent-dashboard': return <ParentDashboard />;
        case 'settings': return <TaskSettings />;
        default: return <ParentDashboard />;
      }
    }
    
    // B. Giao diện Trẻ em
    switch (currentPage) {
      case 'kid-profile': 
        return <KidProfileSettings />; // Trang Profile của bạn
      case 'rewards-shop':
        return <RewardsShop />;
      case 'child-home':
        return <MainChildInterface onNavigate={handleChildNavigate}/>; // Trang chính (Đồng hồ)
      default: 
        return <MainChildInterface  onNavigate={handleChildNavigate}/>; // Trang chính (Đồng hồ)
    }

  };
  // Hàm load profile từ localStorage
  const loadLocalProfile = () => {
    try {
      const saved = localStorage.getItem('kidProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Tìm emoji tương ứng với avatarId
        const avatarObj = AVATAR_OPTIONS.find(a => a.id === parsed.avatarId);
        
        setDisplayProfile({
          name: parsed.name || user?.firstName || "Bé ngoan",
          avatarEmoji: avatarObj?.emoji || null,
          avatarColor: avatarObj?.color || '#FFD966'
        });
      }
    } catch (e) {
      console.error("Lỗi đọc profile", e);
    }
  };

  // Effect: Load lần đầu + Lắng nghe sự kiện thay đổi
  useEffect(() => {
    loadLocalProfile(); // Load ngay khi vào app

    // Lắng nghe sự kiện từ KidProfileSettings bắn sang
    const handleProfileUpdate = () => loadLocalProfile();
    window.addEventListener('kidProfileUpdated', handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('kidProfileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toaster position="top-center" />
      
      {/* 5. ĐÂY LÀ THANH NAVBAR MỚI CỦA BẠN */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            
            {/* Vế trái: Tiêu đề và Vai trò */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage('child-home')}
                  variant="ghost"
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <motion.div
                    className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <img
                      src={pomodoroLogo}
                      alt="FocusBuddy Logo"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <h2 className="font-semibold text-base" style={{ color: '#333333' }}>
                    FocusHero
                  </h2>
                </Button>

              </div>
              
              {/* Hiển thị vai trò (Parent/Child) */}
              <Badge 
                variant="outline"
                className={`text-xs px-2 py-0.5 ${
                  user?.role === 'parent' 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {user?.role === 'parent' ? 'Phụ huynh' : 'Bé'}
              </Badge>
            </div>
            
            {/* Vế phải: Avatar và Menu */}
            <div className="ml-auto flex items-center gap-3">
            
            {/* 1. TEXT CHÀO HỎI & TÊN */}
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500 font-medium">
                {getGreeting()}
              </p>
              <p className="text-sm font-bold text-gray-800">
                {/* 🔥 SỬA: Sử dụng displayProfile.name để cập nhật tên ngay lập tức */}
                {displayProfile.name} 
              </p>
            </div>

            {/* 2. AVATAR & DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                  
                  {/* 🔥 SỬA: Logic hiển thị Avatar */}
                  {displayProfile.avatarEmoji ? (
                    // --- TRƯỜNG HỢP 1: Đã chọn Avatar con vật (từ Settings) ---
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform hover:scale-105"
                      style={{ 
                        backgroundColor: displayProfile.avatarColor + '20', // Màu nền mờ 20%
                        borderColor: displayProfile.avatarColor 
                      }}
                    >
                      <span className="text-lg pt-0.5 select-none leading-none">
                        {displayProfile.avatarEmoji}
                      </span>
                    </div>
                  ) : (
                    // --- TRƯỜNG HỢP 2: Chưa chọn -> Dùng Avatar mặc định (Logic cũ) ---
                    <Avatar className="cursor-pointer h-8 w-8">
                      {/* Nếu user có ảnh thật từ Google/DB thì hiện ảnh */}
                      {user?.avatarUrl ? (
                         <AvatarImage src={user.avatarUrl} alt={user.username} />
                      ) : null}

                      {/* Fallback hiển thị chữ cái đầu */}
                      <AvatarFallback 
                        className={`text-xs font-bold ${
                          user?.role === 'parent' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {/* Lấy chữ cái đầu từ displayProfile cho đồng bộ */}
                        {displayProfile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                </button>
              </DropdownMenuTrigger>

              {/* --- PHẦN MENU DROPDOWN (Giữ nguyên logic cũ của bạn) --- */}
              <DropdownMenuContent className="w-56 z-[100]" align="end">
                
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">Tài khoản</p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {user?.username}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* MENU CHO TRẺ EM */}
                {user?.role === 'child' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('kid-profile')} 
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <UserCircle className="w-4 h-4 mr-2 text-[#333333]" />
                      <span>Hồ sơ của bé</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('mascot-showcase')} 
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <Smile className="w-4 h-4 mr-2 text-[#FFD966]" />
                      <span>Cảm xúc FocusBuddy</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* MENU CHO PHỤ HUYNH */}
                {user?.role === 'parent' && (
                  <>
                    <DropdownMenuItem onClick={() => setCurrentPage('settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Cài đặt Task</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </div>
      </header>

      {/* 6. PHẦN NỘI DUNG CHÍNH (flex-1 để lấp đầy không gian) */}
      <main className="flex-1 overflow-y-auto bg-[#F7F4EE]">
        <AnimatePresence mode="wait">
          <motion.div
            key={user?.role === 'parent' ? currentPage : 'child'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* 7. Thanh điều hướng dưới cùng (chỉ cho Parent) */}
      {user?.role === 'parent' && (
        <nav className="sticky bottom-0 left-0 right-0 border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] shrink-0">
          <div className="grid grid-cols-2 gap-0">
              
              {/* Nút Dashboard */}
              <button
                type="button"
                onClick={() => setCurrentPage('parent-dashboard')}
                className={`
                  flex flex-col items-center justify-center h-16 gap-1.5
                  transition-all duration-200 ease-in-out
                  border-t-2 
                  ${currentPage === 'parent-dashboard' 
                    ? 'bg-amber-50 border-t-amber-400 text-amber-800' 
                    : 'bg-white border-t-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
              >
                <BarChart3 
                  className={`w-5 h-5 transition-colors ${
                    currentPage === 'parent-dashboard' ? 'text-amber-500' : 'text-gray-400'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  currentPage === 'parent-dashboard' ? 'font-semibold' : 'font-normal'
                }`}>
                  Bảng tin
                </span>
              </button>

              {/* Nút Tasks */}
              <button
                type="button"
                onClick={() => setCurrentPage('settings')}
                className={`
                  flex flex-col items-center justify-center h-16 gap-1.5
                  transition-all duration-200 ease-in-out
                  border-t-2
                  ${currentPage === 'settings' 
                    ? 'bg-amber-50 border-t-amber-400 text-amber-800' 
                    : 'bg-white border-t-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
              >
                <Settings 
                  className={`w-5 h-5 transition-colors ${
                    currentPage === 'settings' ? 'text-amber-500' : 'text-gray-400'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  currentPage === 'settings' ? 'font-semibold' : 'font-normal'
                }`}>
                  Nhiệm vụ
                </span>
              </button>
              
            </div>
        </nav>
      )}

    </div>
  );
}
