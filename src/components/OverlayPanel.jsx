import React from 'react';

const OverlayPanel = ({ isRightPanelActive, onSignUpClick, onSignInClick }) => {
  return (
    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[600ms] ease-custom-bezier z-[100] ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
      {/* Cập nhật nền (bg-secondary) và văn bản (text-text-primary) */}
      <div className={`bg-secondary text-text-primary relative -left-full h-full w-[200%] transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
        {/* Left Panel - Chào mừng trở lại */}
        <div className={`absolute top-0 flex flex-col justify-center items-center px-10 h-full w-1/2 text-center transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
          <h2 className="text-[26px] mb-5">Xin chào bạn!</h2>
          <p className="text-[15px] leading-relaxed my-5">
            Bắt đầu hành trình với chúng tôi bằng cách tạo tài khoản mới
          </p>
          {/* Cập nhật nút */}
          <button 
            onClick={onSignInClick}
            className="rounded-[25px] border-2 border-text-primary bg-transparent text-text-primary text-sm font-semibold py-3.5 px-12 tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-none hover:bg-text-primary/10"
          >
            Đăng Nhập
          </button>
        </div>

        {/* Right Panel - Xin chào bạn */}
        <div className={`absolute top-0 right-0 flex flex-col justify-center items-center px-10 h-full w-1/2 text-center transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
          <h2 className="text-[26px] mb-5">Chào mừng trở lại!</h2>
          <p className="text-[15px] leading-relaxed my-5">
            Đăng nhập để tiếp tục kết nối và khám phá những điều thú vị
          </p>
          {/* Cập nhật nút */}
          <button 
            onClick={onSignUpClick}
            className="rounded-[25px] border-2 border-text-primary bg-transparent text-text-primary text-sm font-semibold py-3.5 px-12 tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-none hover:bg-text-primary/10"
          >
            Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayPanel;