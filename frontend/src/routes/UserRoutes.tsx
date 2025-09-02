import FullLayout from '../layout/Fullayout';
import { 
  UserLibrary,
  UserAnnouncement,
  UserBook,
  UserBorrowing,
  UserCategory,
  UserIssue,
  UserProfile,
  UserReadingActivity,
  UserReservation,
  UserReview
} from '../components/lazyComponents';
import TestPage from '../pages/User/TestPage';
import { Navigate } from 'react-router-dom';
import { authen } from '../services/https/authentication/authen-service';

// Protected User Route Component
const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authen.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const user = authen.getUser();
  if (user?.role !== 'user') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const UserRoutes = {
  path: '/user',
  element: (
    <UserProtectedRoute>
      <FullLayout />
    </UserProtectedRoute>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="/user/library" />
    },
    {
      path: 'library',
      element: <UserLibrary />
    },
    {
      path: 'announcement',
      element: <UserAnnouncement />
    },
    {
      path: 'book',
      element: <UserBook />
    },
    {
      path: 'borrowing',
      element: <UserBorrowing />
    },
    {
      path: 'category',
      element: <UserCategory />
    },
    {
      path: 'issue',
      element: <UserIssue />
    },
    {
      path: 'profile',
      element: <UserProfile />
    },
    {
      path: 'reading-activity',
      element: <UserReadingActivity />
    },
    {
      path: 'reservation',
      element: <UserReservation />
    },
    {
      path: 'review',
      element: <UserReview />
    },
    {
      path: 'test',
      element: <TestPage />
    }
  ]
};

export default UserRoutes;