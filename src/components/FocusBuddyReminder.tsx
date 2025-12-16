// src/components/FocusBuddyReminder.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusBuddyReminderProps {
  isDistracted: boolean;
}

export const FocusBuddyReminder: React.FC<FocusBuddyReminderProps> = ({ isDistracted }) => {
  return (
    // Sử dụng AnimatePresence để xử lý hiệu ứng khi component xuất hiện/biến mất
    <AnimatePresence>
      {isDistracted && (
        <motion.div
          // Vị trí cố định ở góc dưới bên phải
          className="fixed bottom-0 right-4 z-[9998] pointer-events-none"
          // Trạng thái ban đầu: ẩn bên dưới màn hình
          initial={{ y: '100%' }}
          // Trạng thái khi xuất hiện: trồi lên (y: 0)
          animate={{ y: '10%' }} // Chỉ ló lên một phần
          // Trạng thái khi biến mất: lặn xuống lại
          exit={{ y: '100%' }}
          // Cấu hình chuyển động mượt mà kiểu lò xo nhẹ
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <div className="relative w-48 h-48">
            {/* THAY THẾ ẢNH NHÂN VẬT CỦA BẠN Ở ĐÂY.
               Nên dùng ảnh PNG trong suốt, vẽ nhân vật đang ngó lên.
            */}
            {/* Placeholder: Nếu chưa có ảnh, dùng tạm cái này để test hiệu ứng */}
             <div className="w-full h-full flex items-end justify-center">
                <span className="text-[8rem]">🧐</span>
             </div>
             {/* <img src="/images/focus-buddy-peek.png" alt="Focus Buddy Peeking" className="w-full h-auto object-contain filter drop-shadow-lg" /> */}
            
            {/* Bong bóng thoại nhỏ (tùy chọn) */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5 }}
               className="absolute -top-4 left-0 bg-white px-3 py-2 rounded-xl rounded-bl-none shadow-md border border-[#FFD966]"
            >
               <p className="text-sm font-medium text-[#B45309] whitespace-nowrap">Mình quay lại bài nhé!</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};