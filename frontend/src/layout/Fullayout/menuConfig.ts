import React from "react";
import {
  // Common icons
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  FileOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

export interface MenuConfig {
  key: string;
  icon: React.ReactElement;
  label: string;
  path: string;
}

export const adminMenuConfig: MenuConfig[] = [
  {
    key: "admin-home",
    icon: React.createElement(HomeOutlined),
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    key: "admin-book",
    icon: React.createElement(BookOutlined),
    label: "Book Management",
    path: "/admin/book",
  },
  {
    key: "admin-borrowing",
    icon: React.createElement(ReadOutlined),
    label: "Borrowing Management",
    path: "/admin/borrowing",
  },
  {
    key: "admin-reservation",
    icon: React.createElement(ScheduleOutlined),
    label: "Reservation Management",
    path: "/admin/reservation",
  },
  {
    key: "admin-category",
    icon: React.createElement(AppstoreOutlined),
    label: "Category Management",
    path: "/admin/category",
  },
  {
    key: "admin-announcement",
    icon: React.createElement(NotificationOutlined),
    label: "Announcement",
    path: "/admin/announcement",
  },
  {
    key: "admin-reading-activity",
    icon: React.createElement(FileTextOutlined),
    label: "Reading Activity",
    path: "/admin/reading-activity",
  },
  {
    key: "admin-issue",
    icon: React.createElement(FileOutlined),
    label: "Issue Management",
    path: "/admin/issue",
  },
];

export const userMenuConfig: MenuConfig[] = [
  {
    key: "user-dashboard",
    icon: React.createElement(HomeOutlined),
    label: "Library",
    path: "/user/dashboard",
  },
  {
    key: "user-borrowing",
    icon: React.createElement(ReadOutlined),
    label: "My Borrowing",
    path: "/user/borrowing",
  },
  {
    key: "user-reservation",
    icon: React.createElement(ScheduleOutlined),
    label: "My Reservations",
    path: "/user/reservation",
  },
  {
    key: "user-category",
    icon: React.createElement(AppstoreOutlined),
    label: "Categories",
    path: "/user/category",
  },
  {
    key: "user-announcement",
    icon: React.createElement(NotificationOutlined),
    label: "Announcements",
    path: "/user/announcement",
  },
  {
    key: "user-reading-activity",
    icon: React.createElement(FileTextOutlined),
    label: "Reading Activity",
    path: "/user/reading-activity",
  },
  {
    key: "user-review",
    icon: React.createElement(StarOutlined),
    label: "My Reviews",
    path: "/user/review",
  },
  {
    key: "user-profile",
    icon: React.createElement(UserOutlined),
    label: "Profile",
    path: "/user/profile",
  },
  {
    key: "user-issue",
    icon: React.createElement(QuestionCircleOutlined),
    label: "Help Center",
    path: "/user/issue",
  },
];

export const createMenuItems = (
  config: MenuConfig[],
  navigate: (path: string) => void,
  setCurrentPage: (role: "admin" | "user", key: string) => void,
  role: "admin" | "user"
): Required<MenuProps>["items"] => {
  return config.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => {
      setCurrentPage(role, item.key);
      navigate(item.path);
    },
  }));
};