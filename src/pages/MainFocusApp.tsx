import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Settings, User, Baby, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MainChildInterface } from '../components/MainChildInterface';
import { ParentDashboard } from '../components/ParentDashboard';
import { TaskSettings } from '../components/TaskSettings';
import { Toaster } from '../components/ui/sonner';

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

type Page = 'parent-dashboard' | 'settings';
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

  const handleLogout = () => {
    logout();
    navigate('/login'); // Điều hướng về trang login
  };

  const renderPage = () => {
    // 6. Logic render dựa trên VAI TRÒ (ROLE) CỦA USER
    if (user?.role === 'parent') {
      // Nếu là parent, render các trang của parent
      switch (currentPage) {
        case 'parent-dashboard':
          return <ParentDashboard />;
        case 'settings':
          return <TaskSettings />;
        default:
          return <ParentDashboard />;
      }
    }
    
    // Mặc định (nếu là child), render giao diện của child
    return <MainChildInterface />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" />
      
      {/* 5. ĐÂY LÀ THANH NAVBAR MỚI CỦA BẠN */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Vế trái: Tiêu đề và Vai trò */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFD966' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="text-xl">🎯</span>
                </motion.div>
                <h2 className="font-semibold text-lg" style={{ color: '#333333' }}>FocusBuddy</h2>
              </div>
              
              {/* Hiển thị vai trò (Parent/Child) */}
              <Badge 
                variant="outline"
                className={
                  user?.role === 'parent' 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-blue-100 text-blue-800 border-blue-200"
                }
              >
                {user?.role === 'parent' ? 'Parent Mode' : 'Child Mode'}
              </Badge>
            </div>

            {/* Vế phải: Avatar và Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
    <button type="button" className="h-9 w-9 rounded-full">
      <Avatar className="cursor-pointer h-9 w-9">
        <AvatarFallback 
          className={
            user?.role === 'parent' 
              ? "bg-green-100 text-green-800" 
              : "bg-blue-100 text-blue-800"
          }
        >
          {getInitials(user?.name || user?.email)}
        </AvatarFallback>
      </Avatar>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56 z-[100]" align="end">
  
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">Tài khoản</p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Nút Cài đặt (chỉ dành cho Parent) */}
                {user?.role === 'parent' && (
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setCurrentPage('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Task Settings</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Đăng xuất</span>
    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* 6. PHẦN NỘI DUNG CHÍNH (flex-1 để lấp đầy không gian) */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={user?.role === 'parent' ? currentPage : 'child'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full" // Đảm bảo motion div chiếm chiều cao
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 7. Thanh điều hướng dưới cùng (chỉ cho Parent) */}
      {user?.role === 'parent' && (
        <div className="sticky bottom-0 left-0 right-0 border-t" style={{ backgroundColor: 'white' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around py-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('parent-dashboard')}
                className="flex-col h-auto py-2 gap-1"
                style={currentPage === 'parent-dashboard' ? { color: '#FFD966' } : { color: '#666666' }}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs">Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('settings')}
                className="flex-col h-auto py-2 gap-1"
                style={currentPage === 'settings' ? { color: '#FFD966' } : { color: '#666666' }}
              >
                <Settings className="w-6 h-6" />
                <span className="text-xs">Tasks</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. XÓA BỎ: Khoảng đệm h-24 không còn cần thiết vì navbar dưới cùng là 'sticky' */}
    </div>
  );
}
