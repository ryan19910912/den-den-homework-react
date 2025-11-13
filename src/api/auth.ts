import api from './axiosInstance';


// 發送註冊驗證碼
export const sendRegisterVerificationCodeApi = (email: string) => {
    return api.post('/auth/send/register/verification/code', { email });
};

// 註冊
export const registerApi = (
    email: string,
    password: string,
    confirmPassword: string,
    verificationCode: string
) => {
    return api.post('/auth/register', { email, password, confirmPassword, verificationCode });
};

// 發送登入驗證碼
export const sendLoginVerificationCodeApi = (email: string) => {
    return api.post('/auth/send/login/verification/code', { email });
};

// 登入
export const loginApi = (
    email: string,
    password: string,
    verificationCode: string
) => {
    return api.post('/auth/login', { email, password, verificationCode });
};

// 登出 (需要 Token，但可選)
export const logoutApi = () => {
    // 如果成功，攔截器會自動帶入 Token
    return api.post('/auth/logout');
};

// 獲取用戶最後登入時間 (需要 Token)
export const getLastLoginTimeApi = () => {
    return api.get('/member/lastLoginTime');
};