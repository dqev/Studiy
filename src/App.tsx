import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider } from '@/src/context/AuthContext';
import { MainLayout } from '@/src/layouts/MainLayout';
import { AuthLayout } from '@/src/layouts/AuthLayout';
import { onAuthChange } from '@/src/firebase/auth';
import { UserRole } from '@/src/types';

// User Pages & Layout
import { UserLayoutPage } from '@/src/pages/user/userlayout/UserLayoutPage';
import { UserHomepage } from '@/src/pages/user/UserHomepage';
import { UserDashboard } from '@/src/pages/user/UserDashboard';
import { SearchUser } from '@/src/pages/user/SearchUser';
import { UserProfile } from '@/src/pages/user/UserProfile';
import { UserResources } from '@/src/pages/user/UserResources';
import { UserUpload } from '@/src/pages/user/UserUpload';
import { UserPendingMaterial } from '@/src/pages/user/UserPendingMaterial';
import { UserSaved } from '@/src/pages/user/UserSaved';
import { UserNotification } from '@/src/pages/user/UserNotification';
import { UserSetting } from '@/src/pages/user/UserSetting';
import { ResourceRequests } from '@/src/pages/user/ResourceRequests';
import { CreateResourceRequest } from '@/src/pages/user/CreateResourceRequest';
import { CampusLostAndFinder } from '@/src/pages/user/CampusLostAndFinder';
import { CreateLostAndFinderItem } from '@/src/pages/user/CreateLostAndFinderItem';
import { LostAndFinderDetail } from '@/src/pages/user/LostAndFinderDetail';
import { ClassMaterial } from '@/src/pages/user/ClassMaterial';

// Admin Pages & Layout
import { AdminLayoutPage } from '@/src/pages/admin/AdminLayoutPage';
import { AdminProfile } from '@/src/pages/admin/AdminProfile';
import { AdminDashboard } from '@/src/pages/admin/AdminDashboard';
import { AdminUsers } from '@/src/pages/admin/AdminUsers';
import { AdminResources } from '@/src/pages/admin/AdminResources';
import { AdminRequests } from '@/src/pages/admin/AdminRequests';
import { AdminReports } from '@/src/pages/admin/AdminReports';
import { AdminSettings } from '@/src/pages/admin/AdminSettings';

// Auth & Landing Pages
import { LandingPage } from '@/src/pages/landing/LandingPage';
import { LoginPage } from '@/src/pages/auth/LoginPage';
import { SignupPage } from '@/src/pages/auth/SignupPage';
import { EmailVerificationPage } from '@/src/pages/auth/EmailVerificationPage';
import { ForgotPasswordPage } from '@/src/pages/auth/ForgotPasswordPage';
import { PlaceholderPage } from '@/src/components/common/PlaceholderPage';

// Component that handles navigation based on auth state
function AppContent() {
  const navigate = useNavigate();
  const previousAuthStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      const isAuthenticated = !!user;

      // Only navigate if auth state actually changed (not on first load)
      if (previousAuthStateRef.current !== null) {
        // Auth state has changed after initial load
        if (previousAuthStateRef.current === true && !isAuthenticated) {
          // User just logged out - redirect to landing page
          navigate('/', { replace: true });
        } else if (previousAuthStateRef.current === false && isAuthenticated) {
          // User just logged in - redirect to dashboard/admin
          if (user?.role === UserRole.ADMIN) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/user', { replace: true });
          }
        }
      }
      // On first load, DON'T redirect - let the router handle the current URL
      // The useRouteProtection hook will redirect if needed

      previousAuthStateRef.current = isAuthenticated;
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      {/* Main/Landing Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<PlaceholderPage title="Features" />} />
        <Route path="/how-it-works" element={<PlaceholderPage title="How it Works" />} />
        <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
        <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* User Routes */}
      <Route element={<UserLayoutPage />}>
        <Route path="/user" element={<UserHomepage />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/resources" element={<UserResources />} />
        <Route path="/user/class-material" element={<ClassMaterial />} />
        <Route path="/user/upload" element={<UserUpload />} />
        <Route path="/user/search" element={<SearchUser />} />
        <Route path="/user/saved" element={<UserSaved />} />
        <Route path="/user/pending" element={<UserPendingMaterial />} />
        <Route path="/user/notifications" element={<UserNotification />} />
        <Route path="/user/settings" element={<UserSetting />} />
        <Route path="/user/requests" element={<ResourceRequests />} />
        <Route path="/user/request/create" element={<CreateResourceRequest />} />
        <Route path="/user/lost-and-finder" element={<CampusLostAndFinder />} />
        <Route path="/user/lost-and-finder/create" element={<CreateLostAndFinderItem />} />
        <Route path="/user/lost-and-finder/:itemId" element={<LostAndFinderDetail />} />
        <Route path="/:username" element={<UserProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayoutPage />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/approvals" element={<AdminRequests />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}