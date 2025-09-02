import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { authen } from "../../../services/https/authentication/authen-service";
import logo from "../../../assets/loginlogo.png";

import './login.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  // ถ้าเคยล็อกอินอยู่แล้วให้เด้งตาม role
  useEffect(() => {
    if (authen.isAuthenticated()) {
      const role = authen.getRole();
      nav(role === "admin" ? "/admin" : "/user", { replace: true });
    }
  }, [nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const res = await authen.login({
        identifier: identifier.trim(),
        password: password,
      });
      authen.saveSession(res.token, res.user);
      message.success("เข้าสู่ระบบสำเร็จ!");
      nav(res.user.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (e: any) {
      console.error('Login error:', e);
      message.error(e?.response?.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
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
                  disabled={loading}
                  className="login-button"
                  data-testid="login-button"
                >
                  {loading ? 'Logging in...' : 'Login now'}
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
