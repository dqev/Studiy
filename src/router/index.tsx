import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/src/layouts/MainLayout';
import { AuthLayout } from '@/src/layouts/AuthLayout';

// User Pages
import { UserLayoutPage } from '@/src/pages/user/userlayout/UserLayoutPage';
import { UserHomepage } from '@/src/pages/user/UserHomepage';
import { UserDashboard } from '@/src/pages/user/UserDashboard';
import { ClassMaterial } from '@/src//pages/user/ClassMaterial';
import { UserProfile } from '@/src/pages/user/UserProfile';
import { UserResources } from '@/src/pages/user/UserResources';
import { UserUpload } from '@/src/pages/user/UserUpload';
import { UserPendingMaterial } from '@/src/pages/user/UserPendingMaterial';
import { UserSaved } from '@/src/pages/user/UserSaved';
import { UserNotification } from '@/src/pages/user/UserNotification';
import { UserSetting } from '@/src/pages/user/UserSetting';
import { ResourceRequests } from '@/src/pages/user/ResourceRequests';
import { CreateResourceRequest } from '@/src/pages/user/CreateResourceRequest';
import { SearchUser } from '@/src/pages/user/SearchUser';
import { CampusLostAndFinder } from '@/src/pages/user/CampusLostAndFinder';
import { CreateLostAndFinderItem } from '@/src/pages/user/CreateLostAndFinderItem';
import { LostAndFinderDetail } from '@/src/pages/user/LostAndFinderDetail';

// Admin Pages
import { AdminLayoutPage } from '@/src/pages/admin/AdminLayoutPage';
import { AdminDashboard } from '@/src/pages/admin/AdminDashboard';
import { AdminProfile } from '@/src/pages/admin/AdminProfile';
import { AdminUsers } from '@/src/pages/admin/AdminUsers';
import { AdminResources } from '@/src/pages/admin/AdminResources';
import { AdminRequests } from '@/src/pages/admin/AdminRequests';
import { AdminReports } from '@/src/pages/admin/AdminReports';
import { AdminSettings } from '@/src/pages/admin/AdminSettings';

// Auth Pages
import { LandingPage } from '@/src/pages/landing/LandingPage';
import { LoginPage } from '@/src/pages/auth/LoginPage';
import { SignupPage } from '@/src/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/src/pages/auth/ForgotPasswordPage';

import { PlaceholderPage } from '@/src/components/common/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'features', element: <PlaceholderPage title="Features" /> },
      { path: 'how-it-works', element: <PlaceholderPage title="How it Works" /> },
      { path: 'resources', element: <PlaceholderPage title="Resources" /> },
      { path: 'faq', element: <PlaceholderPage title="FAQ" /> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  // User Routes
  {
    path: '/user',
    element: <UserLayoutPage />,
    children: [
      { path: 'home', element: <UserHomepage /> },
      { index: true, element: <UserDashboard /> },
      { path: 'resources', element: <UserResources /> },
      { path: 'class-material', element: <ClassMaterial /> },
      { path: 'upload', element: <UserUpload /> },
      { path: 'saved', element: <UserSaved /> },
      { path: 'pending', element: <UserPendingMaterial /> },
      { path: 'notifications', element: <UserNotification /> },
      { path: 'profile', element: <UserProfile /> },
      { path: 'settings', element: <UserSetting /> },
      { path: 'requests', element: <ResourceRequests /> },
      { path: 'request/create', element: <CreateResourceRequest /> },
      { path: 'search', element: <SearchUser /> },
      { path: 'lost-and-finder', element: <CampusLostAndFinder /> },
      { path: 'lost-and-finder/create', element: <CreateLostAndFinderItem /> },
      { path: 'lost-and-finder/:itemId', element: <LostAndFinderDetail /> },
    ],
  },
  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayoutPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'profile', element: <AdminProfile /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'resources', element: <AdminResources /> },
      { path: 'approvals', element: <AdminRequests /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
