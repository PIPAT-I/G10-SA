import FullLayout from '../layout/Fullayout';
import { 
  AdminDashboard,
  AdminAnnouncement,
  AdminAddBook,
  AdminBorrowing,
  AdminCategory,
  AdminIssue,
  AdminReservation,
  AdminBookDetail,
  AdminBookEdit,
  AdminBookRecent,
  AdminBookCollection,
  AdminBookReading
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
    { path: 'book/add', 
      element: <AdminAddBook /> 
    },
    { path: 'book/detail/:id', 
      element: <AdminBookDetail />
    },
    { path: 'book/edit/:id', 
      element: <AdminBookEdit /> 
    },
    { path: 'book/recent', 
      element: <AdminBookRecent /> 
    },
    { path: 'book/collection/:mode/:id?', 
      element: <AdminBookCollection /> 
    },
    { path: 'book/', 
      element: <AdminBookReading /> 
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
      path: 'reservation',
      element: <AdminReservation />
    }
  ]
};

export default AdminRoutes;