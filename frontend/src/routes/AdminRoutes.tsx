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

const AdminRoutes = {
  path: '/admin',
  element: <FullLayout role="admin" />,
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