import { useState } from 'react';
import { Form, Input, Button, message, Row, Col, Typography,  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { type LoginForm } from "../../../interfaces/Sigin";
import logo from "../../../assets/loginlogo.png";

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
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      fontFamily: 'kanit'
    }}>
      <Row style={{ height: '100%' }}>
        {/* Login Form Section */}
        <Col 
          xs={24} 
          md={12} 
          style={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '32px',
            order: 1
          }}
        >
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <Title 
                level={1} 
                style={{ 
                  color: '#FF8A00', 
                  fontSize: '48px', 
                  fontWeight: 900,
                  margin: 0,
                  lineHeight: '1.2'
                }}
              >
                S-Library
              </Title>
              <Title 
                level={3} 
                style={{ 
                  color: '#011F4B', 
                  fontWeight: 600,
                  marginTop: '12px',
                  marginBottom: 0
                }}
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
                  <Text style={{ color: '#4B5563', fontWeight: 500, fontSize: '16px' }}>
                    ID
                  </Text>
                }
                name="user_id"
                rules={[{ required: true, message: 'Please input your ID!' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                  placeholder="ID"
                  style={{ 
                    height: '48px', 
                    fontSize: '16px',
                    backgroundColor: '#F1F3F6',
                    borderRadius: '15px'
                  }}
                  data-testid="user-id-input"
                />
              </Form.Item>

              {/* Password input field */}
              <Form.Item
                label={
                  <Text style={{ color: '#4B5563', fontWeight: 500, fontSize: '16px' }}>
                    Password
                  </Text>
                }
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#9CA3AF'}} />}
                  placeholder="Enter your password"
                  style={{ 
                    height: '48px', 
                    fontSize: '16px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '15px'
                  }}
                  data-testid="password-input"
                />
              </Form.Item>

              {/* Submit button */}
              <Form.Item style={{ marginTop: '24px',textAlign: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '75%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 500,
                    backgroundColor: '#FFE259',
                    borderColor: '#FFA751',
                    borderRadius: '24px',
                    border: 'none'
                  }}
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
          style={{ 
            height: '100%',
            backgroundColor: '#F0F0F0',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            order: 2
          }}
          data-testid="logo-section"
        >
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <img 
              src={logo}
              alt="Library Logo" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain' 
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}