import FullLayout from '../layout/Fullayout';
import { 
  AdminDashboard,
  AdminAnnouncement,
  AdminBorrowing,
  AdminCategory,
  AdminIssue,
  AdminReadingActivity,
  AdminReservation,
  AdminAddBook,
  AdminBookCollection,
  AdminBookDetail,
  AdminBookEdit,
  AdminBookRecent,
  AdminBookReading
} from '../components/lazyComponents';

const AdminRoutes = {
  path: '/admin',
  element: (
      <FullLayout />
    
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
    // Book routes
    { 
      path: 'book/add', 
      element: <AdminAddBook /> 
    },
    { 
      path: 'book/detail/:id', 
      element: <AdminBookDetail />
    },
    { 
      path: 'book/edit/:id', 
      element: <AdminBookEdit /> 
    },
    { 
      path: 'book/recent', 
      element: <AdminBookRecent /> 
    },
    { 
      path: 'book/collection/:mode/:id?', 
      element: <AdminBookCollection /> 
    },
    { 
      path: 'book/', 
      element: <AdminBookReading /> 
    },
    // Other routes
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