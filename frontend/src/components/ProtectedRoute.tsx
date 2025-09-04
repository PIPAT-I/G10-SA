import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // เพิ่ม prop สำหรับระบุ role ที่อนุญาต
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  const userRole = user?.Role?.Name || (user as any)?.role || 'user';

  // ถ้าระบุ allowedRoles และ user ไม่มีสิทธิ์
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect ไปหน้าที่เหมาะสมตาม role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/library" replace />;
    }
  }

  // ถ้าผ่านการตรวจสอบทั้งหมด ให้แสดง children
  return <>{children}</>;
}