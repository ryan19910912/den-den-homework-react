import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Steps, App as AntdApp, Row, Col } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useCountdown } from '../hooks/useCountdown';
import { sendRegisterVerificationCodeApi, registerApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

// 註冊表單的類型定義
interface RegisterFormValues {
    email: string;
    password?: string;
    confirmPassword?: string;
    verificationCode?: string;
}

const RegisterPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [validatedEmail, setValidatedEmail] = useState<string>("");
    const [form] = Form.useForm<RegisterFormValues>();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { notification } = AntdApp.useApp();

    // 導入倒計時 Hook
    const { countdown, isCounting, startCountdown } = useCountdown();

    // --- 步驟 1: 發送驗證碼 ---
    const handleSendCode = async () => {
        try {
            // 確保 email 欄位通過驗證
            const { email } = await form.validateFields(['email']);

            setLoading(true);

            const response = await sendRegisterVerificationCodeApi(email);

            if (response.data && response.data.code === 0) {
                notification.success({
                    message: "🎉發送成功！",
                    description: "登入驗證碼已發送，請檢查信箱！",
                    duration: 4.5,
                    placement: 'top',
                });

                setValidatedEmail(email);

                startCountdown(); // 開始倒計時

                // 驗證碼發送成功後，自動跳到下一步
                setCurrentStep(1);

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
                message: '發送失敗！',
                description: error.response?.data?.msg,
                duration: 4.5,
                placement: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    // --- 步驟 2: 完成註冊 ---
    const handleRegister = async (values: RegisterFormValues) => {
        setLoading(true);
        try {
            const response = await registerApi(
                validatedEmail,
                values.password!,
                values.confirmPassword!,
                values.verificationCode!
            );

            // 檢查回傳值 code 是否為 0
            if (response.data && response.data.code === 0) {

                notification.success({
                    message: '🎉註冊成功！',
                    description: `註冊成功！將為您跳轉至登入頁面。`,
                    duration: 4.5,
                    placement: 'top',
                });

                setTimeout(() => {
                    // 註冊成功後，導航到登入頁面
                    // 使用 navigate 函式進行導航
                    navigate('/login_page');
                }, 2000);

            } else {
                // 如果 code 不為 0，視為業務失敗，顯示 msg 欄位
                notification.warning({
                    message: '註冊失敗！',
                    description: response.data?.msg,
                    duration: 4.5,
                    placement: 'top',
                });
            }

        } catch (error: any) {
            notification.error({
                message: '註冊失敗！',
                description: error.response?.data?.msg,
                duration: 4.5,
                placement: 'top',
            });

        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: '輸入信箱', description: '驗證信箱有效性' },
        { title: '設定密碼', description: '輸入驗證碼並設定密碼' },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card style={{ width: 400, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                <Title level={3} style={{ textAlign: 'center', color: '#1890ff', marginBottom: 24 }}>
                    📝 新用戶註冊
                </Title>
                <Steps
                    current={currentStep}
                    items={steps}
                    style={{ marginBottom: 30 }}
                />

                <Form
                    form={form}
                    name="register_form"
                    layout="vertical"
                    onFinish={handleRegister} // 只有在最後一步點擊時才會觸發
                >
                    {/* ------------------- 步驟 1: 信箱輸入 ------------------- */}
                    {currentStep === 0 && (
                        <>
                            <Form.Item
                                label="電子郵件"
                                name="email"
                                rules={[
                                    { required: true, message: '請輸入電子郵件！' },
                                    { type: 'email', message: '請輸入有效的電子郵件格式！' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="您的信箱" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 30 }}>
                                <Button
                                    type="primary"
                                    onClick={handleSendCode}
                                    loading={loading || isCounting}
                                    style={{ width: '100%', height: 40 }}
                                >
                                    {isCounting ? `驗證碼已發送 (${countdown}s)` : '發送驗證碼'}
                                </Button>
                                <div style={{ textAlign: 'center', marginTop: 15 }}>
                                    <Link to="/login_page">已有帳號？返回登入</Link>
                                </div>
                            </Form.Item>
                        </>
                    )}

                    {/* ------------------- 步驟 2: 密碼與驗證碼 ------------------- */}
                    {currentStep === 1 && (
                        <>
                            <div style={{ marginBottom: 15, padding: '10px 15px', background: '#e6f7ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
                                已發送驗證碼至 {validatedEmail || '您的信箱'}
                            </div>

                            {/* 驗證碼輸入 */}
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

                            {/* 密碼輸入 */}
                            <Form.Item
                                label="設定密碼"
                                name="password"
                                rules={[{ required: true, message: '請設定密碼！' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="新密碼" />
                            </Form.Item>

                            {/* 確認密碼 */}
                            <Form.Item
                                label="確認密碼"
                                name="confirmPassword"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    { required: true, message: '請確認您的密碼！' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('兩次輸入的密碼不一致！'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="確認密碼" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 30 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ width: '100%', height: 40 }}
                                >
                                    確認並註冊
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => setCurrentStep(0)}
                                    style={{ width: '100%', marginTop: 10 }}
                                >
                                    返回上一步
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;