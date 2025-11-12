import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Các component của bạn
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainFocusApp from './pages/MainFocusApp.tsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainFocusApp />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;