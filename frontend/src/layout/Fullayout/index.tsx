import React, { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Badge, Space } from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import "./FullLayout.css";

// Import menu configs directly
import { 
  adminMenuConfig, 
  userMenuConfig, 
  createMenuItems
} from "./menuConfig";

const { Sider, Header, Content } = Layout;

// ---- Constants ----
const LAYOUT_CONSTANTS = {
  SIDER_WIDTH: 250,
  SIDER_COLLAPSED_WIDTH: 80,
  SIDER_MARGIN_LEFT: 10,
  HEADER_HEIGHT: 80,
  BREAKPOINT: "lg" as const,
} as const;

// ---- Helpers ----
const getPageKey = (role: "admin" | "user"): string =>
  role === "admin" ? "admin-home" : "user-dashboard";

const getStoredPage = (role: "admin" | "user"): string =>
  localStorage.getItem(`page:${role}`) || getPageKey(role);

const setCurrentPage = (role: "admin" | "user", val: string): void =>
  localStorage.setItem(`page:${role}`, val);

// ---- Types ----
interface FullLayoutProps {
  role: "admin" | "user";
}

// ---- Main Component ----
const FullLayout: React.FC<FullLayoutProps> = ({ role }) => {
  const navigate = useNavigate();

  // Layout states
  const [collapsed, setCollapsed] = useState(true);
  const [broken, setBroken] = useState(false);

  // Page state from localStorage
  const page = getStoredPage(role);

  
  const isReader = false; 
  

  // Calculate visible width
  const siderVisibleWidth = collapsed
    ? broken ? 0 : LAYOUT_CONSTANTS.SIDER_COLLAPSED_WIDTH
    : LAYOUT_CONSTANTS.SIDER_WIDTH;

  // Menu configuration
  const menuConfig = role === "admin" ? adminMenuConfig : userMenuConfig;

  // Generate menu items using the helper function
  const menuItems: Required<MenuProps>["items"] = useMemo(
    () => createMenuItems(menuConfig, navigate, setCurrentPage, role),
    [menuConfig, navigate, role]
  );

  // Calculate positions
  const headerLeft = isReader ? 0 : broken ? 0 : siderVisibleWidth + LAYOUT_CONSTANTS.SIDER_MARGIN_LEFT;

  return (
    <Layout className="full-layout">
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
        className={`layout-sider ${isReader ? 'reading-mode' : ''}`}
        style={{
          margin: `10px 0 0 ${LAYOUT_CONSTANTS.SIDER_MARGIN_LEFT}px`,
        }}
      >
        {/* Logo / Brand */}
        <div
          className={`sider-logo ${collapsed && !broken ? 'collapsed' : 'expanded'}`}
          onClick={() => {
            const key = getPageKey(role);
            setCurrentPage(role, key);
            navigate(role === "admin" ? "/admin" : "/user/library");
          }}
        >
          {collapsed && !broken ? "S" : "S-Library"}
        </div>

        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[page]}
          className="sider-menu"
          inlineCollapsed={collapsed && !broken}
        />
      </Sider>

      <Layout>
        <Header
          className={`layout-header ${isReader ? 'reading-mode' : ''}`}
          style={{
            left: headerLeft,
          }}
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
            <Badge
              dot
              size="small"
              offset={[-2, 6]}
              styles={{ 
                indicator: { 
                  backgroundColor: '#ff4d4f',
                  boxShadow: "0 0 0 2px #f9f9f9" 
                } 
              }}
            >
              <Avatar
                size={31}
                style={{ background: "transparent" }}
                icon={<BellOutlined style={{ fontSize: 23, color: "#888" }} />}
              />
            </Badge>
            <Avatar
              size={36}
              style={{ background: "#c4c4c4" }}
              icon={<UserOutlined style={{ color: "#fff", fontSize: 20 }} />}
            />
          </Space>
        </Header>

        <Content
          className={`layout-content ${
            isReader 
              ? 'sidebar-hidden' 
              : broken 
                ? 'sidebar-hidden' 
                : collapsed 
                  ? 'sidebar-collapsed' 
                  : 'sidebar-expanded'
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
