import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhTW from 'antd/locale/zh_TW'; // 引入 AntD 繁體中文語言包

// 引入頁面組件
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MemberPage from './pages/MemberPage';

// 定義一個高階組件 (HOC) 來保護路由
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('jwtToken');

  if (!isAuthenticated) {
    // 如果未登入，重定向到登入頁面
    return <Navigate to="/login" replace />;
  }

  // 如果已登入，渲染目標組件
  return element;
};


const App: React.FC = () => {
  return (
    // 使用 Ant Design 的 ConfigProvider 進行全局配置，例如中文語言
    <ConfigProvider locale={zhTW}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            {/* 公開路由：所有人可存取 */}
            <Route path="/login_page" element={<LoginPage />} />
            <Route path="/register_page" element={<RegisterPage />} />

            {/* 私有路由：需要登入才能存取 */}
            {/* 使用 PrivateRoute 包裝 MemberPage */}
            <Route
              path="/member_page"
              element={<PrivateRoute element={<MemberPage />} />}
            />

            {/* 預設路由：訪問根路徑時導航到登入頁 */}
            <Route path="/" element={<Navigate to="/login_page" replace />} />

            {/* TODO: 可以添加 404 頁面 */}
            <Route path="*" element={<h1>404 找不到頁面</h1>} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;