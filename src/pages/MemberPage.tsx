import React, { useCallback, useState } from 'react';
import { Card, Typography, Button, App as AntdApp } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';
import { getLastLoginTimeApi, logoutApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface MemberData {
    lastLoginTime: string;
}

const MemberPage: React.FC = () => {
    const [data, setData] = useState<MemberData | null>(null);
    const [loading, setLoading] = useState(false);

    const userEmail = localStorage.getItem('userEmail');

    const navigate = useNavigate();

    const { message, notification } = AntdApp.useApp();

    const handleFetchLastLoginTime = useCallback(async () => {

        // 1. 檢查 Token
        if (!localStorage.getItem('jwtToken')) {
            notification.warning({
                message: "請先登入！",
                duration: 2,
                placement: 'top',
            });
            navigate('/login_page');
            return; // 終止函式執行
        }

        setLoading(true);

        try {
            const response = await getLastLoginTimeApi(); // 呼叫需要 Token 的 API

            if (response.data && response.data.code === 0) {
                // 獲取成功
                setData(response.data?.data);
                notification.success({
                    message: "獲取資訊成功！",
                    duration: 2,
                    placement: 'top',
                });
            } else if (response.data && response.data.code === 401) {
                // 401: Token 失效/過期，需要重新登入
                notification.warning({
                    message: "登入憑證過期！請重新登入。",
                    duration: 4.5,
                    placement: 'top',
                });

                // 延遲後導航
                setTimeout(() => {
                    navigate('/login_page');
                }, 2000);
            } else {
                // 其他錯誤代碼
                notification.error({
                    message: "獲取用戶資訊失敗！",
                    description: response.data.msg,
                    duration: 4.5,
                    placement: 'top',
                });
            }
        } catch (error: any) {
            // 處理網路或 API 呼叫本身的錯誤 (例如 403 Forbidden, 500 Internal Error)
            const errorMsg = error.response?.data?.msg || "網路或伺服器錯誤";

            notification.error({
                message: "獲取用戶資訊失敗！",
                description: errorMsg,
                duration: 4.5,
                placement: 'top',
            });
        } finally {
            setLoading(false);
        }
    }, [navigate]); // navigate 作為依賴項

    // 處理登出
    const handleLogout = async () => {
        try {

            const response = await logoutApi(); // 呼叫登出 API (將 Token 加入黑名單)

            if (response.data && response.data.code === 0) {
                notification.success({
                    message: "🎉登出成功！",
                    description: "登出成功，將會您返回登入頁面。",
                    duration: 4.5,
                    placement: 'top',
                });

                setTimeout(() => {
                    // 登出成功後，導航到登入頁面
                    // 使用 navigate 函式進行導航
                    navigate('/login_page');
                }, 2000);

            } else {
                notification.warning({
                    message: "登出失敗！",
                    description: response.data.msg,
                    duration: 4.5,
                    placement: 'top',
                });
            }

        } catch (error: any) {
            notification.error({
                message: "登出失敗！",
                description: error.response?.data?.msg,
                duration: 4.5,
                placement: 'top',
            });

        } finally {
            // 清除本地存儲
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userEmail');
            navigate('/login_page');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
            <Card title={<Title level={2}>👑 會員專區</Title>}
                extra={<Button type="primary" danger icon={<PoweroffOutlined />} onClick={handleLogout}>登出</Button>}
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Text strong>歡迎回來！</Text>
                <div style={{ marginTop: 20 }}>
                    <Text type="secondary">您的電子郵件: </Text>
                    {/* 這裡應該從 Token 或額外的 API 接口獲取 Email，暫時用佔位符 */}
                    <Text>{userEmail}</Text>
                </div>
                <div style={{ marginTop: 10 }}>
                    {/* 觸發按鈕 */}
                    <button
                        onClick={handleFetchLastLoginTime}
                        disabled={loading}
                    >
                        {loading ? '載入中...' : '點我獲取最後登入時間'}
                    </button>

                    {/* 顯示資料 */}
                    {data && (
                        <div style={{ marginTop: '20px' }}>
                            <p>最後登入時間: <strong>{data.lastLoginTime}</strong></p>
                            {/* 顯示其他會員資料... */}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MemberPage;