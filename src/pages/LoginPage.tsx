import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App as AntdApp, Row, Col } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { loginApi, sendLoginVerificationCodeApi } from '../api/auth';
import { useCountdown } from '../hooks/useCountdown';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

interface LoginFormValues {
    email: string;
    password: string;
    verificationCode: string;
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<LoginFormValues>();

    const { countdown, isCounting, startCountdown } = useCountdown();

    const { message, notification } = AntdApp.useApp();

    const navigate = useNavigate();

    // --- 登入處理：提交所有欄位 ---
    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            // 提交 Email, Password, VerificationCode 進行登入
            const response = await loginApi(values.email, values.password, values.verificationCode);

            console.log("response: ", response);

            if (response.data && response.data.code === 0) {

                const token = response.data?.data?.token;

                if (token) {
                    localStorage.setItem('jwtToken', token);
                    localStorage.setItem('userEmail', values.email);

                    notification.success({
                        message: '🎉登入成功！',
                        description: `您已登入成功，將為您跳轉至用戶頁面。`,
                        duration: 4.5,
                        placement: 'top',
                    });

                    setTimeout(() => {
                        // 登入成功後，導航到會員頁面
                        // 使用 navigate 函式進行導航
                        navigate('/member_page');
                    }, 2000);
                } else {
                    notification.warning({
                        message: '登入失敗！',
                        description: `伺服器未返回 Token。`,
                        duration: 4.5,
                        placement: 'top',
                    });

                }
            } else {
                notification.error({
                    message: '登入失敗！',
                    description: response.data.msg,
                    duration: 4.5,
                    placement: 'top',
                });
            }
        } catch (error: any) {

            notification.error({
                message: "登入失敗！",
                description: error.response?.data?.msg,
                duration: 4.5,
                placement: 'top',
            });

        } finally {
            setLoading(false);
        }
    };

    // --- 發送驗證碼處理 ---
    const handleSendCode = async () => {
        try {
            // 只驗證 Email 欄位的值
            const { email } = await form.validateFields(['email']);

            setLoading(true);

            const response = await sendLoginVerificationCodeApi(email);

            if (response.data && response.data.code === 0) {
                notification.success({
                    message: "🎉發送成功！",
                    description: "登入驗證碼已發送，請檢查信箱！",
                    duration: 4.5,
                    placement: 'top',
                });

                startCountdown(); // 開始倒計時
            } else {
                notification.warning({
                    message: "發送失敗！",
                    description: response.data.msg,
                    duration: 4.5,
                    placement: 'top',
                });
            }

        } catch (error: any) {
            notification.error({
                message: "發送失敗！",
                description: error.response?.data?.msg,
                duration: 4.5,
                placement: 'top',
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card
                style={{ width: 400, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                bodyStyle={{ padding: 30 }}
            >
                <Title level={3} style={{ textAlign: 'center', color: '#0050b3', marginBottom: 24 }}>
                    🔐 會員登入
                </Title>

                <Form
                    form={form}
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{ remember: true }}
                >

                    {/* 1. Email 輸入 */}
                    <Form.Item
                        label="電子郵件"
                        name="email"
                        rules={[{ required: true, message: '請輸入電子郵件！' }, { type: 'email', message: '格式不正確！' }]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="已註冊的電子郵件"
                            type="email"
                        />
                    </Form.Item>

                    {/* 2. 密碼輸入 */}
                    <Form.Item
                        label="密碼"
                        name="password"
                        rules={[{ required: true, message: '請輸入密碼！' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密碼"
                        />
                    </Form.Item>

                    {/* 3. 驗證碼輸入和發送按鈕 (使用 Row/Col 佈局) */}
                    <Form.Item label="驗證碼">
                        <Row gutter={8}>
                            <Col span={14}>
                                <Form.Item
                                    name="verificationCode"
                                    noStyle
                                    rules={[{ required: true, message: '請輸入驗證碼！' }]}
                                >
                                    <Input
                                        prefix={<SafetyOutlined />}
                                        placeholder="請輸入驗證碼"
                                        maxLength={6}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={10}>
                                <Button
                                    onClick={handleSendCode}
                                    disabled={isCounting || loading}
                                    loading={loading && !isCounting}
                                    style={{ width: '100%' }}
                                >
                                    {isCounting ? `${countdown}s 後重發` : '發送驗證碼'}
                                </Button>
                            </Col>
                        </Row>
                    </Form.Item>

                    {/* 登入按鈕 */}
                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ width: '100%', height: 40 }}
                        >
                            確認登入
                        </Button>
                    </Form.Item>
                </Form>

                {/* 底部鏈接 */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to="/register_page" style={{ marginRight: 16 }}>新用戶註冊</Link>
                </div>

            </Card>
        </div>
    );
};

export default LoginPage;