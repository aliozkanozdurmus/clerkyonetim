import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Import the actual DashboardPage
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder for DashboardPage can be removed now
// const DashboardPagePlaceholder = () => (
//   <div className="bg-white p-6 rounded-lg shadow-md">
//     <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
//     <p>User list and management features will be here.</p>
//     <p className="mt-4 text-sm text-gray-600">Automatic user locking and session revocation for expired subscriptions is handled by the backend when this page loads data.</p>
//   </div>
// );

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  const { VITE_APP_TITLE } = import.meta.env;
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = VITE_APP_TITLE || 'Clerk Admin Panel';
  }, [VITE_APP_TITLE]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage /> {/* Use the actual DashboardPage */}
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Redirect logic: if authenticated, go to dashboard, else to login */}
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App; 