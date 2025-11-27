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
    <div className="flex flex-col h-screen overflow-hidden">
      <Toaster position="top-center" />
      
      {/* 5. ĐÂY LÀ THANH NAVBAR MỚI CỦA BẠN */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            
            {/* Vế trái: Tiêu đề và Vai trò */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFD966' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="text-lg">🎯</span>
                </motion.div>
                <h2 className="font-semibold text-base" style={{ color: '#333333' }}>FocusBuddy</h2>
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
                {user?.role === 'parent' ? 'Parent' : 'Child'}
              </Badge>
            </div>

            {/* Vế phải: Avatar và Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarFallback 
                      className={`text-xs ${
                        user?.role === 'parent' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}
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
                    <span>Settings</span>
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
      <main className="flex-1 overflow-hidden bg-[#F7F4EE]">
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
                  Dashboard
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
                  Tasks
                </span>
              </button>
              
            </div>
        </nav>
      )}

      {/* 8. XÓA BỎ: Khoảng đệm h-24 không còn cần thiết vì navbar dưới cùng là 'sticky' */}
    </div>
  );
}
