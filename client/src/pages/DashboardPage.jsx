import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; // For potential error handling or token refresh logic

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3380';

// Helper to format date or return N/A
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR'); // Turkish date format
};

// Helper to calculate days remaining and provide a descriptive string
const getDaysRemainingText = (days) => {
  if (days === null || days === undefined || isNaN(days)) return 'N/A';
  if (days <= 0) return 'Süresi Doldu';
  return `Kalan: ${days} gün`;
};

const UserRow = ({ user, onLockUser }) => {
  const isActive = user.isActive && !user.isLocked;
  const rowColor = user.isLocked ? 'bg-red-200' : (isActive ? 'bg-green-100' : 'bg-yellow-100');
  const textColor = user.isLocked ? 'text-red-700' : (isActive ? 'text-green-700' : 'text-yellow-700');

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${rowColor} ${textColor} hover:bg-opacity-70 transition-colors duration-150`}
    >
      <td className="px-4 py-3 border-b border-gray-200 text-sm">{user.id}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">{user.email || 'N/A'}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">{user.firstName || 'N/A'}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">{user.lastName || 'N/A'}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">{formatDate(user.subscriptionEnd)}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm font-medium">{getDaysRemainingText(user.daysRemaining)}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isLocked ? 'bg-red-500 text-white' : (isActive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black')}`}>
          {user.isLocked ? 'Kilitli' : (isActive ? 'Aktif' : 'Pasif')}
        </span>
      </td>
      <td className="px-4 py-3 border-b border-gray-200 text-sm">
        {!user.isLocked && (
          <motion.button
            onClick={() => onLockUser(user.id)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors duration-150 disabled:opacity-50"
            disabled={user.isLocked} // Should be redundant if button is not shown, but good for safety
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Kilitle
          </motion.button>
        )}
      </td>
    </motion.tr>
  );
};

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  // useAuth can be used if we need to handle global auth errors, e.g., token expired
  const { logout } = useAuth(); 

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.error || 'Kullanıcılar yüklenirken bir hata oluştu.');
      if (err.response?.status === 401) { // Unauthorized
        logout(); // If token is invalid or expired, log out
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Fetch users on component mount

  const handleLockUser = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/${userId}/lock`);
      // The backend should return the updated user list or success status
      // For now, we re-fetch or update the local state based on server.js logic
      if(response.data.success && response.data.users) {
        setUsers(response.data.users);
      } else {
        fetchUsers(); // Re-fetch if specific user list isn't returned
      }
    } catch (err) {
      console.error("Error locking user:", err);
      setError(err.response?.data?.error || 'Kullanıcı kilitlenirken bir hata oluştu.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        if (filter === 'active') return user.isActive && !user.isLocked;
        if (filter === 'inactive') return !user.isActive || user.isLocked;
        return true; // 'all'
      })
      .filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.id?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower)
        );
      });
  }, [users, searchTerm, filter]);

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Hata!</strong>
        <span className="block sm:inline"> {error}</span>
        <button onClick={fetchUsers} className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Kullanıcı Yönetimi</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <input 
          type="text"
          placeholder="Ara (ID, Email, Ad, Soyad)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex space-x-2">
          {['all', 'active', 'inactive'].map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 
                ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {f === 'all' ? 'Tümü' : (f === 'active' ? 'Aktif' : 'Pasif/Kilitli')}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white ">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Email', 'Ad', 'Soyad', 'Subscription Bitiş', 'Kalan Gün', 'Durum', 'İşlem'].map(header => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserRow key={user.id} user={user} onLockUser={handleLockUser} />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                    {users.length === 0 && !isLoading ? 'Gösterilecek kullanıcı bulunamadı.' : 'Arama kriterlerine uygun kullanıcı bulunamadı.'}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DashboardPage; 