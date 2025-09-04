
import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../components/lazyComponents';;
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';

const MainRoutes = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/login',
    element: <Login />
  },
  AdminRoutes,
  UserRoutes
]);

export default MainRoutes;