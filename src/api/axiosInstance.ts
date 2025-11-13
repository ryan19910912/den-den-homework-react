import axios from 'axios';

// 設置 API 基礎路徑
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 請求攔截器：自動帶入 JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // 只有在 token 存在時才設置 Authorization Header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 響應攔截器：處理通用錯誤（例如 401 未授權）
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 範例：如果 401 發生，強制登出
            localStorage.removeItem('jwtToken');
            // 可以導航到登入頁面
            // window.location.href = '/login_page'; 
        }
        return Promise.reject(error);
    }
);

export default api;