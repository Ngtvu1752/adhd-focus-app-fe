import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Settings, User, Baby } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MainChildInterface } from '../components/MainChildInterface';
import { ParentDashboard } from '../components/ParentDashboard';
import { TaskSettings } from '../components/TaskSettings';
import { Toaster } from '../components/ui/sonner';

type Page = 'child' | 'parent-dashboard' | 'settings';
type UserMode = 'child' | 'parent';

export default function MainFocusApp() {
  const [userMode, setUserMode] = useState<UserMode>('child');
  const [currentPage, setCurrentPage] = useState<Page>('child');

  const renderPage = () => {
    switch (currentPage) {
      case 'child':
        return <MainChildInterface />;
      case 'parent-dashboard':
        return <ParentDashboard />;
      case 'settings':
        return <TaskSettings />;
      default:
        return <MainChildInterface />;
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />
      
      {/* Mode Selector - Top Bar */}
      <div className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFD966' }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <span className="text-2xl">🎯</span>
              </motion.div>
              <div>
                <h2 style={{ color: '#333333' }}>FocusBuddy</h2>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Focus & Learning App for Kids
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={userMode === 'child' ? 'default' : 'outline'}
                onClick={() => {
                  setUserMode('child');
                  setCurrentPage('child');
                }}
                className="rounded-full"
                style={userMode === 'child' ? {
                  backgroundColor: '#FFD966',
                  color: '#333333'
                } : {}}
              >
                <Baby className="w-4 h-4 mr-2" />
                Child Mode
              </Button>
              <Button
                variant={userMode === 'parent' ? 'default' : 'outline'}
                onClick={() => {
                  setUserMode('parent');
                  setCurrentPage('parent-dashboard');
                }}
                className="rounded-full"
                style={userMode === 'parent' ? {
                  backgroundColor: '#FFD966',
                  color: '#333333'
                } : {}}
              >
                <User className="w-4 h-4 mr-2" />
                Parent Mode
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Bar - Only for Parent Mode */}
      {userMode === 'parent' && (
        <div className="fixed bottom-0 left-0 right-0 border-t" style={{ backgroundColor: 'white' }}>
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

      {/* Bottom spacing to prevent content from being hidden by nav bar - Only for parent */}
      {userMode === 'parent' && <div className="h-24"></div>}
    </div>
  );
}
