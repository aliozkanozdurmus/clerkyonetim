import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; // To add a logout button or user info
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Clerk Admin Panel</h1>
          <motion.button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="app-footer">
        <p>Ali Özkan Özdurmuş tarafından geliştirilmiştir</p>
      </footer>
    </div>
  );
};

export default MainLayout; 