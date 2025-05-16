'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  publicMetadata: {
    subscription_end?: string;
  };
}

export default function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      await axios.post(`/api/users/${userId}/lock`);
      await fetchUsers();
    } catch (error) {
      console.error('Error locking user:', error);
    }
  };

  const getDaysRemaining = (subscriptionEnd: string) => {
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    return differenceInDays(endDate, today);
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && getDaysRemaining(user.publicMetadata.subscription_end || '') > 0) ||
      (filter === 'expired' && getDaysRemaining(user.publicMetadata.subscription_end || '') <= 0);

    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'expired')}
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="expired">Süresi Dolmuş</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Abonelik Bitiş
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kalan Gün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const daysRemaining = getDaysRemaining(user.publicMetadata.subscription_end || '');
              const isExpired = daysRemaining <= 0;

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={isExpired ? 'bg-red-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.publicMetadata.subscription_end
                        ? format(new Date(user.publicMetadata.subscription_end), 'dd MMMM yyyy', { locale: tr })
                        : 'Belirtilmemiş'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      {isExpired ? 'Süresi Doldu' : `Kalan: ${daysRemaining} gün`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isExpired && (
                      <button
                        onClick={() => handleLockUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hesabı Kilitle
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
} 