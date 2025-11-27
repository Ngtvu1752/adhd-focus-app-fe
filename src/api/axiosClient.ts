import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000', // Thay bằng URL backend thực tế của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động gắn Token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken'); // Hoặc lấy từ nơi bạn lưu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor cho Response: Xử lý lỗi chung (ví dụ: Token hết hạn -> logout)
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data; // Trả về data trực tiếp cho gọn
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi chung, ví dụ: 401 Unauthorized
    if (error.response?.status === 401) {
      // Logic logout tự động hoặc refresh token
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    throw error;
  }
);

export default axiosClient;