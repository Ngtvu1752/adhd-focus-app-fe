import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
interface User {
  id?: string;
  username: string; // Đổi từ email sang username
  name: string;
  role: 'parent' | 'child';
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, isParent?: boolean) => Promise<void>;
  signup: (name: string, username: string, password: string, isParent?: boolean) => Promise<User>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, isParent: boolean = true) => {
    try {
      // 1. Xác định role gửi lên Server
      // Ví dụ: Parent -> "SUPERVISOR", Child -> "CHILD" (hoặc tên role bên backend quy định cho con)
      const apiRole = isParent ? "SUPERVISOR" : "CHILD";

      // 2. Gọi API
      const response: any = await authApi.login({ 
        username, 
        password, 
        role: apiRole 
      });
      
      // Response mẫu: { message: "...", token: "..." }
      const { token } = response;

      if (!token) throw new Error("Không nhận được token từ server");

      // 3. Lưu Token
      localStorage.setItem('accessToken', token);

      // 4. Tạo đối tượng User để lưu vào App (Vì API không trả về info user)
      // Chúng ta lấy luôn username người dùng nhập để làm tên hiển thị
      const userData: User = {
        username: username,
        name: username, // Có thể đổi thành tên thật nếu có API lấy info
        role: isParent ? 'parent' : 'child' // Map lại về role của App Frontend
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = (name: string, username: string, password: string, isParent: boolean = true): Promise<User> => {
    // Mô phỏng API call
    // Mặc định đăng ký là 'SUPERVISOR', bạn có thể thêm logic sau
    const userData: User = {
      username,
      name,
      role: isParent ? 'parent' : 'child', 
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
