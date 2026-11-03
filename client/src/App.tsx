import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { CustomerSupportChat } from './components/ui/CustomerSupportChat';
import { useAuth } from './contexts/AuthContext';

// Layout components
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Auth pages
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));

// Public pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Properties = lazy(() => import('./pages/Properties').then(m => ({ default: m.Properties })));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail').then(m => ({ default: m.PropertyDetail })));

// User pages (protected)
const Dashboard = lazy(() => import('./pages/user/Dashboard').then(m => ({ default: m.Dashboard })));
const BookingDetail = lazy(() => import('./pages/user/BookingDetail').then(m => ({ default: m.BookingDetail })));
const Profile = lazy(() => import('./pages/user/Profile').then(m => ({ default: m.Profile })));

// Host pages (protected)
const HostDashboard = lazy(() => import('./pages/host/Dashboard').then(m => ({ default: m.HostDashboard })));
const HostProperties = lazy(() => import('./pages/host/Properties').then(m => ({ default: m.HostProperties })));
const HostPropertyForm = lazy(() => import('./pages/host/PropertyForm').then(m => ({ default: m.HostPropertyForm })));
const HostBookings = lazy(() => import('./pages/host/Bookings').then(m => ({ default: m.HostBookings })));
const HostEarnings = lazy(() => import('./pages/host/Earnings').then(m => ({ default: m.HostEarnings })));

// Admin pages (protected)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.AdminUsers })));
const AdminProperties = lazy(() => import('./pages/admin/Properties').then(m => ({ default: m.AdminProperties })));
const AdminBookings = lazy(() => import('./pages/admin/Bookings').then(m => ({ default: m.AdminBookings })));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics').then(m => ({ default: m.AdminAnalytics })));

// Auth wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'HOST' || user.role === 'ADMIN' ? '/host' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/properties" element={<MainLayout><Properties /></MainLayout>} />
        <Route path="/properties/:id" element={<MainLayout><PropertyDetail /></MainLayout>} />

        {/* Auth routes */}
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/reset-password/:token" element={<MainLayout><ResetPassword /></MainLayout>} />

        {/* User protected routes */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['USER', 'HOST', 'ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/bookings/:id"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['USER', 'HOST', 'ADMIN']}>
                <BookingDetail />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['USER', 'HOST', 'ADMIN']}>
                <Profile />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Host protected routes */}
        <Route
          path="/host"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostDashboard />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/host/properties"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostProperties />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/host/properties/new"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostPropertyForm />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/host/properties/:id/edit"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostPropertyForm />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostBookings />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/host/earnings"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                <HostEarnings />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProperties />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminBookings />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <MainLayout>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAnalytics />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CustomerSupportChat />
    </Suspense>
  );
};

export default App;