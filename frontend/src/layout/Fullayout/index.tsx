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
import { authen } from "../../services/https/authentication/authen-service";
import { adminMenuConfig, userMenuConfig } from "./menuConfig";

const FullLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  
  const currentUser = authen.getUser();
  const role = currentUser?.role as "admin" | "user" || "user";

  // ตรวจสอบการ login
  useEffect(() => {
    if (!authen.isAuthenticated() || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate, currentUser]);

 
  const handleLogout = () => {
    authen.logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/user/profile');
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
  const menuItems = role === "admin" ? adminMenuConfig : userMenuConfig;
  const currentPath = window.location.pathname;

  if (!currentUser) {
    return null;
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
                {currentUser.firstname} {currentUser.lastname}
              </span>
              <span className="user-role">({role})</span>
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
