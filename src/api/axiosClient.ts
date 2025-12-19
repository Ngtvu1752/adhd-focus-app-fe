import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data; // Trả về data trực tiếp cho gọn
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    throw error;
  }
);

export default axiosClient;