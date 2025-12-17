// src/hooks/useTTS.ts
import { useCallback, useState, useRef } from 'react';
import { ttsApi } from '../api/ttsApi';
import { useAuth } from '../context/AuthContext'; 

export const useTTS = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 🔥 MỚI: Dùng Ref để chặn ngay lập tức các lệnh gọi dồn dập
  const isSpeakingRef = useRef(false);

  const processText = useCallback((rawText: string) => {
    const childName = user?.firstName || user?.username || "Bé";
    return rawText.replace(/{name}/g, childName);
  }, [user]);

  const speak = useCallback(async (textTemplate: string, context?: string) => {
    // 1. CHẶN NẾU ĐANG NÓI: Nếu đang phát âm thanh thì hủy lệnh mới ngay
    if (isSpeakingRef.current) {
        console.log("🤫 Đang nói, bỏ qua lệnh mới:", textTemplate);
        return;
    }

    const finalText = processText(textTemplate);
    console.log(`TTS Speaking: "${finalText}"`); 

    // Lock ngay lập tức
    isSpeakingRef.current = true;
    setIsPlaying(true);

    try {
      const audioUrl = await ttsApi.speak({
        text: finalText,
        child_id: user?.id || "guest",
        context: context || "general"
      });

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        
        // Khi audio chạy xong hoặc lỗi -> Mở khóa
        const unlock = () => {
            isSpeakingRef.current = false;
            setIsPlaying(false);
        };
        
        audio.onended = unlock;
        audio.onerror = unlock;
        
        await audio.play();
      } else {
        // Nếu không lấy được link -> Mở khóa ngay
        isSpeakingRef.current = false;
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Lỗi TTS:", error);
      isSpeakingRef.current = false;
      setIsPlaying(false);
    }
  }, [user, processText]); // Bỏ dependency isPlaying để tránh stale closure

  return { speak, isPlaying };
};