import { useState } from 'react';
import { Form, Input, Button, message, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { type LoginForm } from "../../../interfaces/Sigin";
import logo from "../../../assets/loginlogo.png";
import './login.css';

const { Title, Text } = Typography;

/**
 * Login page component
 * @returns The login page component
 */
export default function LoginPage() {
  // State for login button loading status
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Handle form submission
   * @param {LoginForm} values - The form values
   */
  const onFinish = async (values: LoginForm): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Implement actual API call to backend
      console.log('Login values:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Login form submitted!');
    } catch (error) {
      message.error('Form submission failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row className="login-row">
        {/* Login Form Section */}
        <Col 
          xs={24} 
          md={12} 
          className="login-form-section"
        >
          <div className="login-form-wrapper">
            {/* Header */}
            <div className="login-header">
              <Title 
                level={1} 
                className="login-title"
              >
                S-Library
              </Title>
              <Title 
                level={3} 
                className="login-subtitle"
              >
                Login into your account
              </Title>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              size="large"
            >
              {/* User ID input field */}
              <Form.Item
                label={
                  <Text className="login-form-label">
                    ID
                  </Text>
                }
                name="user_id"
                rules={[{ required: true, message: 'Please input your ID!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="login-icon" />}
                  placeholder="ID"
                  className="login-input"
                  data-testid="user-id-input"
                />
              </Form.Item>

              {/* Password input field */}
              <Form.Item
                label={
                  <Text className="login-form-label">
                    Password
                  </Text>
                }
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="login-icon" />}
                  placeholder="Enter your password"
                  className="login-password-input"
                  data-testid="password-input"
                />
              </Form.Item>

              {/* Submit button */}
              <Form.Item className="login-button-wrapper">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-button"
                  data-testid="login-button"
                >
                  Login now
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

        {/* Logo Section */}
        <Col 
          xs={24} 
          md={12} 
          className="logo-section"
          data-testid="logo-section"
        >
          <div className="logo-wrapper">
            <img 
              src={logo}
              alt="Library Logo" 
              className="logo-image"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
