import MinimalLayout from '../layout/MinimalLayout';
import { Login } from '../components/lazyComponents';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';
import { Navigate } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { authen } from '../services/https/authentication/authen-service';

// Auto-redirect based on authentication status
const AutoRedirect = () => {
  if (authen.isAuthenticated()) {
    const user = authen.getUser();
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />;
  }
  return <Navigate to="/login" replace />;
};
const MainRoutes = createBrowserRouter([
  {
    path: '/',
    element: <AutoRedirect />
  },
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
]);



export default MainRoutes;