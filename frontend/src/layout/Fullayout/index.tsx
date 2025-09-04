import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import "./FullLayout.css";
import { useAuth } from "../../contexts/AuthContext";
import { adminMenuConfig, userMenuConfig } from "./menuConfig";

function FullLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // ดึง role จาก user object (รองรับทั้ง GetCurrentUser และ login response)
  const userRole = user?.Role?.Name || (user as any)?.role || 'user';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    // Navigate ไป profile ตาม role
    if (userRole === 'admin') {
      navigate('/admin/profile'); // หรือ path ที่ admin ใช้
    } else {
      navigate('/user/profile');
    }
  };

  // สร้าง dropdown menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: handleProfile,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // เลือก menu ตาม role
  const menuItems = userRole === "admin" ? adminMenuConfig : userMenuConfig;
  const currentPath = window.location.pathname;

  // แสดง loading ขณะกำลังโหลด
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
       

        {/* Menu */}
        <nav className="sidebar-nav">
          <button className="sidebar-logo">S-Library</button>

          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${currentPath === item.path ? 'nav-item-active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false); // ปิด sidebar บน mobile
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-right">
            {/* Notification */}
            <div className="notification">
              <BellOutlined />
            </div>

            {/* User Info */}
            <div className="user-info">
              <span className="user-name">
                {user?.Firstname} {user?.Lastname}
              </span>
              <span className="user-role">({userRole})</span>
            </div>

            {/* User Avatar with Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-avatar-dropdown">
                <div className="user-avatar">
                  <UserOutlined />
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Content Area */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FullLayout;  