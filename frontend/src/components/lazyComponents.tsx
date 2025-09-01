import { lazy } from 'react';
import Loadable from './third-partry/Lodable';

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
export const UserLibrary = Loadable(
lazy(() => import('../pages/User/Library/userLibraryPage')));
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
