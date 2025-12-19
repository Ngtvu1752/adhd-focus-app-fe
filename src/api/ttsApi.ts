import axios from 'axios';

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
      

      if (response.data && response.data.audio_url) {
        return `${TTS_BASE_URL}${response.data.audio_url}`;
      }
      return null;
    } catch (error) {
      console.error("Lỗi gọi API TTS:", error);
      return null; 
    }
  }
};