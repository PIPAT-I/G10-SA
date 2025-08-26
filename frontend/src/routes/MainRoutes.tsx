import { Navigate } from 'react-router-dom';
import MinimalLayout from '../layout/MinimalLayout';
import { Login } from '../components/lazyComponents';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';

const MainRoutes = [
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  // Login Route (Minimal Layout)
  {
    path: '/login',
    element: (
      <MinimalLayout>
        <Login />
      </MinimalLayout>
    )
  },
  // Admin Routes
  AdminRoutes,
  // User Routes  
  UserRoutes
];

export default MainRoutes;