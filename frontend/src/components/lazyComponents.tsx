import { lazy } from 'react';
import Loadable from './third-partry/Loadable';

// ======================== Authentication Pages ========================
export const Login = Loadable(
  lazy(() => import('../pages/authentication/Login/login')));

// ======================== Admin Pages ========================
export const AdminDashboard = Loadable(
  lazy(() => import('../pages/Admin')));

export const AdminAnnouncement = Loadable(
  lazy(() => import('../pages/Admin/Announcement/announcementPage')));

export const AdminBook = Loadable(
  lazy(() => import('../pages/Admin/Book/bookPage')));

export const AdminAddBook = Loadable(
  lazy(() => import('../pages/Admin/Book/Add')));

export const AdminBookCollection = Loadable(
  lazy(() => import('../pages/Admin/Book/BookCollection')));

export const AdminBookDetail      = Loadable(
  lazy(() => import('../pages/Admin/Book/Detail')));

export const AdminBookEdit        = Loadable(
  lazy(() => import('../pages/Admin/Book/Edit')));

export const AdminBookRecent      = Loadable(
  lazy(() => import('../pages/Admin/Book/Recent')));

export const AdminBookReading      = Loadable(
  lazy(() => import('../pages/Admin/Book/Reading')));


export const AdminBorrowing = Loadable(
  lazy(() => import('../pages/Admin/Borrowing/borrowingPage')));

export const AdminCategory = Loadable(
  lazy(() => import('../pages/Admin/Category/categoryPage')));

export const AdminIssue = Loadable(
  lazy(() => import('../pages/Admin/Issue/issuePage')));

export const AdminReadingActivity = Loadable(
  lazy(() => import('../pages/Admin/ReadingActivity/readingActivityPage')));

export const AdminReservation = Loadable(
  lazy(() => import('../pages/Admin/Reservation/ReservationPage')));


  // ======================== User Pages ========================
export const UserDashboard = Loadable(
  lazy(() => import('../pages/User')));

export const UserAnnouncement = Loadable(
  lazy(() => import('../pages/User/Announcement/announcementPage')));

export const UserBook = Loadable(
  lazy(() => import('../pages/User/Book/bookPage')));

export const UserBorrowing = Loadable(
  lazy(() => import('../pages/User/Borrowing/borrowingPage')));

export const UserCategory = Loadable(
  lazy(() => import('../pages/User/Category/categoryPage')));

export const UserIssue = Loadable(
  lazy(() => import('../pages/User/Issue/issuePage')));

export const UserProfile = Loadable(
  lazy(() => import('../pages/User/Profile/profilePage')));

export const UserReadingActivity = Loadable(
  lazy(() => import('../pages/User/ReadingActivity/readingActivityPage')));

export const UserReservation = Loadable(
  lazy(() => import('../pages/User/Reservation/reservationPage')));

export const UserReview = Loadable(
  lazy(() => import('../pages/User/Review/reviewPage')));