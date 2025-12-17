// src/api/ttsApi.ts
import axios from 'axios';

// Địa chỉ server TTS của bạn
const TTS_BASE_URL = 'http://localhost:8001';

interface TTSRequest {
  text: string;
  child_id?: string;
  supervisor_id?: string;
  context?: string;
}

interface TTSResponse {
  audio_url: string;
  cached: boolean;
  provider: string;
}

export const ttsApi = {
  speak: async (data: TTSRequest): Promise<string | null> => {
    try {
      const response = await axios.post<TTSResponse>(`${TTS_BASE_URL}/api/tts/speak`, data);
      
      // Server trả về đường dẫn tương đối (vd: /static/audio_cache/file.mp3)
      // Ta cần ghép với domain gốc để thành link hoàn chỉnh
      if (response.data && response.data.audio_url) {
        return `${TTS_BASE_URL}${response.data.audio_url}`;
      }
      return null;
    } catch (error) {
      console.error("Lỗi gọi API TTS:", error);
      return null; // Trả về null để phía UI biết mà xử lý (vd: fallback sang âm thanh mặc định)
    }
  }
};