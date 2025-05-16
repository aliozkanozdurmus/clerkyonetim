import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './UserTable.css';

function UserTable({ users, onRefresh, isLoading, apiUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'

  const handleLockUser = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}/lock`, {
        method: 'POST'
      });

      if (response.ok) {
        onRefresh();
      } else {
        console.error('Failed to lock user:', response.statusText);
        alert('Failed to lock user. Please try again.');
      }
    } catch (error) {
      console.error('Error locking user:', error);
      alert('Network error. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && user.isActive) ||
      (filter === 'expired' && !user.isActive);

    return matchesSearch && matchesFilter;
  });

  // Animation variants
  const tableContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const tableRow = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Input focus animasyonu için güvenli değerler
  const inputFocusVariants = {
    focused: { 
      scale: 1.02, 
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)"
    },
    unfocused: { 
      scale: 1, 
      boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)" 
    }
  };

  // Format date for readability
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid date';
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // No users to display
  if (users.length === 0 && !isLoading) {
    return (
      <motion.div 
        className="no-users"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h3>No users found</h3>
        <p>There are no users matching your search criteria.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="user-table-container"
      variants={tableContainer}
      initial="hidden"
      animate="show"
    >
      <div className="table-controls">
        <motion.input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          variants={inputFocusVariants}
          initial="unfocused"
          whileFocus="focused"
        />
        <motion.select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
          whileHover={{ scale: 1.05 }}
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="expired">Expired Users</option>
        </motion.select>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Subscription End</th>
            <th>Days Left</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                variants={tableRow}
                className={user.isActive ? 'active-row' : 'expired-row'}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                layout
              >
                <td className="user-id">{user.id.substring(0, 8)}...</td>
                <td className="user-name">
                  {user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'No name'}
                </td>
                <td className="user-email">{user.email || 'No email'}</td>
                <td className="subscription-end">{formatDate(user.subscriptionEnd)}</td>
                <td className="days-remaining">
                  <motion.span
                    className={`days-badge ${
                      user.daysRemaining > 30 ? 'many-days' :
                      user.daysRemaining > 7 ? 'few-days' :
                      user.daysRemaining > 0 ? 'very-few-days' : 'expired-days'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {user.daysRemaining > 0 
                      ? `${user.daysRemaining} days` 
                      : 'Expired'}
                  </motion.span>
                </td>
                <td className="user-status">
                  <motion.span
                    className={`status-badge ${
                      user.isLocked ? 'locked' : 
                      user.isActive ? 'active' : 'expired'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {user.isLocked 
                      ? 'Locked' 
                      : user.isActive 
                        ? 'Active' 
                        : 'Expired'}
                  </motion.span>
                </td>
                <td className="user-actions">
                  {!user.isLocked && (
                    <motion.button
                      className="lock-button"
                      onClick={() => handleLockUser(user.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      Lock Account
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      
      <motion.div 
        className="table-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="user-count">{filteredUsers.length} users found</p>
      </motion.div>
    </motion.div>
  );
}

export default UserTable; 