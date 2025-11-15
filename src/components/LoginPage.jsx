import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import OverlayPanel from './OverlayPanel';

const LoginPage = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };

  return (
    <div className="font-['Roboto','Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] min-h-screen flex justify-center items-center bg-bg-primary overflow-hidden">
      {/* Animated background circles - Cập nhật màu sắc */}
      <div className="absolute rounded-full bg-[#809BCE]/30 w-[300px] h-[300px] -top-[150px] -left-[150px] animate-float"></div>
      <div className="absolute rounded-full bg-[#809BCE]/30 w-[200px] h-[200px] -bottom-[100px] -right-[100px] animate-float [animation-delay:4s]"></div>
      <div className="absolute rounded-full bg-[#809BCE]/30 w-[150px] h-[150px] top-1/2 right-[10%] animate-float [animation-delay:2s]"></div>

      {/* Main container */}
      <div className={`relative w-[850px] h-[550px] bg-white rounded-[30px] shadow-[0_30px_80px_rgba(0,0,0,0.3)] overflow-hidden z-[1] ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        {/* Sign In Container */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-[600ms] ease-custom-bezier ${isRightPanelActive ? 'translate-x-full' : 'translate-x-0'} ${isRightPanelActive ? 'z-[1]' : 'z-[2]'} left-0`}>
      
          <SignInForm isParent={isParent} 
            setIsParent={setIsParent} />
        </div>

        {/* Sign Up Container */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-[600ms] ease-custom-bezier left-0 ${isRightPanelActive ? 'translate-x-full opacity-100 z-[5]' : 'translate-x-0 opacity-0 z-[1]'}`}>
          <SignUpForm isParent={isParent} 
            setIsParent={setIsParent}/>
        </div>

        {/* Overlay Container */}
        <OverlayPanel 
          isRightPanelActive={isRightPanelActive}
          onSignUpClick={handleSignUpClick}
          onSignInClick={handleSignInClick}
        />
      </div>
    </div>
  );
};

export default LoginPage;   