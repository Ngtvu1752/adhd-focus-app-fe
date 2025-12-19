import React from 'react';

const OverlayPanel = ({ isRightPanelActive, onSignUpClick, onSignInClick }) => {
  return (
    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[600ms] ease-custom-bezier z-[100] ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
      {/* Cập nhật nền (bg-secondary) và văn bản (text-text-primary) */}
      <div className={`bg-secondary text-text-primary relative -left-full h-full w-[200%] transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
        {/* Left Panel - Chào mừng trở lại */}
        <div className={`absolute top-0 flex flex-col justify-center items-center px-10 h-full w-1/2 text-center transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
          <h2 className="text-[26px] mb-5">Chào mừng bạn quay lại!</h2>
          <p className="text-[15px] leading-relaxed my-5">
             Để tiếp tục bài học và gặp lại những người bạn thú vị, hãy đăng nhập nhé!
          </p>
          {/* Cập nhật nút */}
          <button 
            onClick={onSignInClick}
            className="rounded-[25px] border-2 border-text-primary bg-transparent text-text-primary text-sm font-semibold py-3.5 px-12 tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-none hover:bg-text-primary/10"
          >
            Đăng nhập
          </button>
        </div>

        {/* Right Panel - Xin chào bạn */}
        <div className={`absolute top-0 right-0 flex flex-col justify-center items-center px-10 h-full w-1/2 text-center transition-transform duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
          <h2 className="text-[26px] mb-5">Xin chào bạn mới!</h2>
          <p className="text-[15px] leading-relaxed my-5">
            Hãy tham gia cùng chúng tớ để khám phá thật nhiều điều hay và bổ ích!
          </p>
          {/* Cập nhật nút */}
          <button 
            onClick={onSignUpClick}
            className="rounded-[25px] border-2 border-text-primary bg-transparent text-text-primary text-sm font-semibold py-3.5 px-12 tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-none hover:bg-text-primary/10"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayPanel;