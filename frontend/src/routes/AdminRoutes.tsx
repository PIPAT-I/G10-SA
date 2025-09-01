import FullLayout from '../layout/Fullayout';
import { 
  AdminDashboard,
  AdminAnnouncement,
  AdminBook,
  AdminBorrowing,
  AdminCategory,
  AdminIssue,
  AdminReadingActivity,
  AdminReservation
} from '../components/lazyComponents';
import { Navigate } from 'react-router-dom';
import { authen } from '../services/https/authentication/authen-service';

// Protected Admin Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authen.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const user = authen.getUser();
  if (user?.role !== 'admin') {
    return <Navigate to="/user" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoutes = {
  path: '/admin',
  element: (
    <AdminProtectedRoute>
      <FullLayout />
    </AdminProtectedRoute>
  ),
  children: [
    {
      path: '',
      element: <AdminDashboard />
    },
    {
      path: 'dashboard',
      element: <AdminDashboard />
    },
    {
      path: 'announcement',
      element: <AdminAnnouncement />
    },
    {
      path: 'book',
      element: <AdminBook />
    },
    {
      path: 'borrowing',
      element: <AdminBorrowing />
    },
    {
      path: 'category',
      element: <AdminCategory />
    },
    {
      path: 'issue',
      element: <AdminIssue />
    },
    {
      path: 'reading-activity',
      element: <AdminReadingActivity />
    },
    {
      path: 'reservation',
      element: <AdminReservation />
    }
  ]
};

export default AdminRoutes;