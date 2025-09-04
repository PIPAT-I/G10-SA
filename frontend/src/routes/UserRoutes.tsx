import { Navigate } from 'react-router-dom';
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




const UserRoutes = {
  path: '/user',
  element: (
      <FullLayout />

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
  ]
};

export default UserRoutes;