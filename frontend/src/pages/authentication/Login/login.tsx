import { useState } from 'react';
import { message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../../../assets/loginlogo.png";

import './login.css';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const result = await loginUser({ identifier: identifier.trim(), password });
      if (result.success) {
        message.success("เข้าสู่ระบบสำเร็จ");
        
        // ตรวจสอบ role และ redirect ไปยัง path ที่เหมาะสม
        const userRole = result.user?.role || 'user';
        const from = location.state?.from?.pathname;
        
        let redirectPath = '/';
        if (userRole === 'admin') {
          redirectPath = from && from.startsWith('/admin') ? from : '/admin/dashboard';
        } else {
          redirectPath = from && from.startsWith('/user') ? from : '/user/library';
        }
        
        // ใช้ navigate แทน location.href เพื่อไม่ให้ refresh หน้า
        setTimeout(() => {
          navigate("/user/library");
        }, 1500);
      }
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };
  return (
      <div className="login-container">
        <div className="login-row">
          {/* Login Form Section */}
          <div className="login-form-section">
            <div className="login-form-wrapper">
              {/* Header */}
              <div className="login-header">
                <h1 className="login-title">S-Library</h1>
                <h3 className="login-subtitle">Login into your account</h3>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* ID/Email Input */}
                <div className="form-group">
                  <label className="form-label">ID/Email</label>
                  <div className="input-wrapper">
                    <UserOutlined className="input-icon" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Email or ID"
                      className="form-input"
                      required
                      data-testid="user-id-input"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <LockOutlined className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-input"
                      required
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      data-testid="password-toggle"
                    >
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-group">
                  <button
                    type="submit"
                    className="login-button"
                    data-testid="login-button"
                  >
                    Login now
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Logo Section */}
          <div className="logo-section" data-testid="logo-section">
            <div className="logo-wrapper">
              <img src={logo} alt="Library Logo" className="logo-image" />
            </div>
          </div>
        </div>
      </div>
  );
}