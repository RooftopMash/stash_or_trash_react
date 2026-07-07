import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from './context/LocalizationContext';
import useAuth from './hooks/useAuth';
import Loading from './components/Loading';

// Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const AuthPage = React.lazy(() => import('./pages/auth/AuthPage'));
const UserDashboard = React.lazy(() => import('./pages/user/Dashboard'));
const BrandDashboard = React.lazy(() => import('./pages/brand/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

const ProtectedRoute = ({ children, allowedTypes }) => {
  const { user, userType, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedTypes && !allowedTypes.includes(userType)) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Suspense fallback={<Loading />}><Landing /></Suspense>} />
      <Route path="/auth" element={<Suspense fallback={<Loading />}><AuthPage /></Suspense>} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/user/*"
        element={
          <ProtectedRoute allowedTypes={['user']}>
            <Suspense fallback={<Loading />}>
              <UserDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/brand/*"
        element={
          <ProtectedRoute allowedTypes={['brand']}>
            <Suspense fallback={<Loading />}>
              <BrandDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/*"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <Suspense fallback={<Loading />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocalizationProvider>
          <Suspense fallback={<Loading />}>
            <AppRoutes />
          </Suspense>
        </LocalizationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
