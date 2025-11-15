import React, { createContext, useContext, useState, useEffect } from 'react';
interface User {
  email: string;
  name: string;
  role: 'parent' | 'child'; // Vai trò bây giờ rõ ràng
  loginTime: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, isParent?: boolean) => Promise<User>;
  signup: (name: string, email: string, password: string, isParent?: boolean) => Promise<User>;
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
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string, isParent: boolean = false): Promise<User> => {
    // Mô phỏng API call
    console.log("Logging in as", isParent ? "parent" : "child");
    
    const userData: User = {
      email,
      name: email.split('@')[0],
      role: isParent ? 'parent' : 'child', // Đặt vai trò ở đây
      loginTime: new Date().toISOString()
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const signup = (name: string, email: string, password: string, isParent: boolean = false): Promise<User> => {
    // Mô phỏng API call
    // Mặc định đăng ký là 'child', bạn có thể thêm logic sau
    const userData: User = {
      email,
      name,
      role: isParent ? 'parent' : 'child', 
      loginTime: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
