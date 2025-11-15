import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUpForm = ({ isParent, setIsParent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password, isParent);
      navigate('/app');
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full py-6 px-8 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center">
        <h1 className="font-bold mb-6 text-text-primary text-[32px]">Tạo Tài Khoản</h1>
        
        <div className="flex gap-3 mb-4">
          {/* Cập nhật hover/shadow theo màu --color-accent */}
          <a href="#" className="border border-gray-300 rounded-full inline-flex justify-center items-center h-11 w-11 transition-all duration-300 ease-in-out hover:border-accent hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(255,217,102,0.3)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4267B2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="border border-gray-300 rounded-full inline-flex justify-center items-center h-11 w-11 transition-all duration-300 ease-in-out hover:border-accent hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(255,217,102,0.3)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#DB4437">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </a>
          <a href="#" className="border border-gray-300 rounded-full inline-flex justify-center items-center h-11 w-11 transition-all duration-300 ease-in-out hover:border-accent hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(255,217,102,0.3)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        
        <span className="text-[13px] text-text-primary/60 mb-6">hoặc sử dụng email</span>
        
        {/* Cập nhật input fields */}
        <div className="relative w-full mb-4">
          <input 
            type="text" 
            placeholder=" " 
            required 
            className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-neutral-light focus:outline-none focus:border-accent focus:bg-white focus:-translate-y-0.5 focus:shadow-[0_5px_15px_rgba(255,217,102,0.2)] peer"
          />
          <label className="absolute left-5 top-4 text-text-primary/60 text-sm transition-all duration-300 pointer-events-none bg-white px-1 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent">
            Họ và Tên
          </label>
        </div>
        
        <div className="relative w-full mb-4">
          <input 
            type="email" 
            placeholder=" " 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-neutral-light focus:outline-none focus:border-overlay-start focus:bg-white focus:-translate-y-0.5 focus:shadow-[0_5px_15px_rgba(74,144,226,0.2)] peer"
          />
          <label className="absolute left-5 top-4 text-text-primary/60 text-sm transition-all duration-300 pointer-events-none bg-white px-1 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent">
            Email
          </label>
        </div>
        
        <div className="relative w-full mb-4">
          <input 
            type="password" 
            placeholder=" " 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-neutral-light focus:outline-none focus:border-overlay-start focus:bg-white focus:-translate-y-0.5 focus:shadow-[0_5px_15px_rgba(74,144,226,0.2)] peer"
          />
          <label className="absolute left-5 top-4 text-text-primary/60 text-sm transition-all duration-300 pointer-events-none bg-white px-1 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent">
            Mật khẩu
          </label>
        </div>
        
        <div className="relative w-full mb-6">
          <input 
            type="password" 
            placeholder=" " 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-neutral-light focus:outline-none focus:border-overlay-start focus:bg-white focus:-translate-y-0.5 focus:shadow-[0_5px_15px_rgba(74,144,226,0.2)] peer"
          />
          <label className="absolute left-5 top-4 text-text-primary/60 text-sm transition-all duration-300 pointer-events-none bg-white px-1 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent">
            Nhập lại mật khẩu
          </label>
        </div>
        <div className="w-full mb-6">
          <label htmlFor="isParentCheckSignUp" className="flex items-center gap-2 cursor-pointer text-text-primary/80">
            <input 
              type="checkbox"
              id="isParentCheckSignUp" // Đổi ID
              checked={isParent}
              onChange={(e) => setIsParent(e.target.checked)}
              className="w-4 h-4"
            />
            Tôi là phụ huynh
          </label>
        </div>
        
        {/* Cập nhật nút "Đăng Ký" */}
                
        <button 
          type="submit"
          disabled={loading}
          className="rounded-[25px] border-none bg-login-accent from-overlay-start to-overlay-end text-white text-sm font-semibold py-3.5 px-12 tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-[0_5px_15px_rgba(74,144,226,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(74,144,226,0.6)] active:-translate-y-0.5 w-full max-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;