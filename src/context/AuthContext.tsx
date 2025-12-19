import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
interface User {
  id?: string;
  username: string; 
  lastName?: string;
  firstName?: string;
  role: 'parent' | 'child';
  totalPoints: number;
  userLevel: number;
  currentStreak: number;
  avatarUrl?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, isParent?: boolean) => Promise<void>;
  signup: (username: string, firstName: string, lastName: string, password: string, isParent?: boolean) => Promise<void>;
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
      const apiRole = isParent ? "SUPERVISOR" : "CHILD";

      const response: any = await authApi.login({ 
        username, 
        password, 
        role: apiRole 
      });
      console.log("Login Response:", response);
      const { token } = response;

      if (!token) throw new Error("Không nhận được token từ server");

      localStorage.setItem('accessToken', token);

      const userData: User = {
        username: username,
        firstName: response.user?.firstName || "",
        lastName: response.user?.lastName || "",
        role: isParent ? 'parent' : 'child', 
        id: response.user.id, 
        totalPoints: response.user?.totalPoints ?? 0,
        userLevel: response.user?.userLevel ?? 0,
        currentStreak: response.user?.currentStreak ?? 0
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async(username: string, firstName: string, lastName: string, password: string, isParent: boolean = true): Promise<void> => {
    try {
      const apiRole = isParent ? "SUPERVISOR" : "CHILD";
      console.log("Signing up with:", { username, firstName, lastName, password, role: apiRole });
      await authApi.signup({ 
        username, 
        firstName,
        lastName,
        password, 
        role: apiRole 
      });
      await login(username, password, isParent);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;  
    }
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
