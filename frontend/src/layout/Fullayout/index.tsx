import React, { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Badge, Space, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
  BookOutlined,
  LogoutOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "./Fullayout.css";

// Import menu configs
import { adminMenuConfig, userMenuConfig, createMenuItems } from "./menuConfig";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const LAYOUT_CONSTANTS = {
  SIDER_WIDTH: 250,
  SIDER_COLLAPSED_WIDTH: 80,
  SIDER_MARGIN_LEFT: 10,
  HEADER_HEIGHT: 80,
  BREAKPOINT: "lg" as const,
} as const;

const getPageKey = (role: "admin" | "user"): string =>
  role === "admin" ? "admin-home" : "user-dashboard";

const getStoredPage = (role: "admin" | "user"): string =>
  localStorage.getItem(`page:${role}`) || getPageKey(role);

const setCurrentPage = (role: "admin" | "user", val: string): void =>
  localStorage.setItem(`page:${role}`, val);

interface FullLayoutProps {
  role: "admin" | "user";
}

const FullLayout: React.FC<FullLayoutProps> = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [broken, setBroken] = useState(false);

  const page = getStoredPage(role);
  const username = localStorage.getItem("username") || "User";
  const isReader = false;

  const siderVisibleWidth = collapsed
    ? broken
      ? 0
      : LAYOUT_CONSTANTS.SIDER_COLLAPSED_WIDTH
    : LAYOUT_CONSTANTS.SIDER_WIDTH;

  const menuConfig = role === "admin" ? adminMenuConfig : userMenuConfig;
  const menuItems: Required<MenuProps>["items"] = useMemo(
    () => createMenuItems(menuConfig, navigate, setCurrentPage, role),
    [menuConfig, navigate, role]
  );

  const headerLeft =
    isReader ? 0 : broken ? 0 : siderVisibleWidth + LAYOUT_CONSTANTS.SIDER_MARGIN_LEFT;

  // Logout function
  const Logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Dropdown items
  const userDropdownItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Edit Profile",
      icon: <EditOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "booklist",
      label: "Booklist",
      icon: <BookOutlined />,
      onClick: () => navigate("/booklist"),
    },
     {
      key: "change-password",
      label: "เปลี่ยนรหัสผ่าน",
      icon: <LockOutlined />,
      onClick: () => navigate("/password-reset"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: Logout,
    },
  ];

  return (
    <Layout className="full-layout">
      {/* Sidebar */}
      <Sider
        width={LAYOUT_CONSTANTS.SIDER_WIDTH}
        collapsed={collapsed}
        collapsedWidth={broken ? 0 : LAYOUT_CONSTANTS.SIDER_COLLAPSED_WIDTH}
        breakpoint={LAYOUT_CONSTANTS.BREAKPOINT}
        onBreakpoint={(isBroken) => {
          setBroken(isBroken);
          if (isBroken) setCollapsed(true);
        }}
        onMouseEnter={() => !broken && setCollapsed(false)}
        onMouseLeave={() => !broken && setCollapsed(true)}
        className={`layout-sider ${isReader ? "reading-mode" : ""}`}
        style={{
          margin: `10px 0 0 ${LAYOUT_CONSTANTS.SIDER_MARGIN_LEFT}px`,
        }}
      >
        {/* Logo */}
        <div
          className={`sider-logo ${collapsed && !broken ? "collapsed" : "expanded"}`}
          onClick={() => {
            const key = getPageKey(role);
            setCurrentPage(role, key);
            navigate(role === "admin" ? "/admin" : "/");
          }}
        >
          {collapsed && !broken ? "S" : "S-Library"}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[page]}
          className="sider-menu"
          inlineCollapsed={collapsed && !broken}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          className={`layout-header ${isReader ? "reading-mode" : ""}`}
          style={{ left: headerLeft }}
        >
          <div className="header-left">
            {broken && (
              <span
                role="button"
                aria-label="Toggle menu"
                onClick={() => setCollapsed((v) => !v)}
                className="header-toggle-btn"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </span>
            )}
          </div>

          <Space size={16} align="center" className="header-right">
            <Badge dot size="small" offset={[-2, 6]}>
              <Avatar
                size={31}
                style={{ background: "transparent" }}
                icon={<BellOutlined style={{ fontSize: 23, color: "#888" }} />}
              />
            </Badge>

            {/* User dropdown */}
            <Dropdown
              menu={{ items: userDropdownItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Space
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: 8,
                  transition: "background 0.2s",
                }}
              >
                <Avatar size={32} style={{ background: "#c4c4c4" }} icon={<UserOutlined />} />
                <Text strong style={{ color: "#333" }}>
                  {username}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          className={`layout-content ${
            isReader
              ? "sidebar-hidden"
              : broken
              ? "sidebar-hidden"
              : collapsed
              ? "sidebar-collapsed"
              : "sidebar-expanded"
          }`}
        >
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FullLayout;
