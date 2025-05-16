import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserTable from './UserTable';
import './Dashboard.css';

function Dashboard({ apiUrl }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  // Memoize fetchUsers to avoid recreating it on every render
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Temel API isteği - artık kimlik doğrulama yok
      const response = await fetch(`${apiUrl}/api/users`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Handle locking of expired users
  const handleLockExpiredUsers = useCallback(async () => {
    const expiredUsers = users.filter(user => !user.isActive && !user.isLocked);
    
    if (expiredUsers.length === 0) return;
    
    setIsLoading(true);
    
    for (const user of expiredUsers) {
      try {
        const response = await fetch(`${apiUrl}/api/users/${user.id}/lock`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          console.error(`Failed to lock user ${user.id}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error locking user ${user.id}:`, error);
      }
    }
    
    // Refresh the user list after locking expired users
    await fetchUsers();
  }, [users, fetchUsers, apiUrl]);

  // Initial load
  useEffect(() => {
    fetchUsers();
    
    // Set up automatic refresh every minute
    const interval = setInterval(() => {
      fetchUsers();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Check for expired users on initial load and after each refresh
  useEffect(() => {
    if (users.length > 0 && !isLoading) {
      handleLockExpiredUsers();
    }
  }, [users, isLoading, handleLockExpiredUsers]);

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter(user => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? user.isActive :
      !user.isActive;

    const matchesSearch = 
      searchTerm === '' ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring", 
        stiffness: 300, 
        damping: 24
      }
    }
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      variants={containerVariants}
    >
      <motion.header 
        className="dashboard-header"
        variants={itemVariants}
      >
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Clerk User Management
        </motion.h1>
        <div className="header-actions">
          {lastRefresh && (
            <motion.div 
              className="last-refresh"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
            >
              Last updated: {lastRefresh.toLocaleTimeString()}
            </motion.div>
          )}
          <motion.button
            onClick={fetchUsers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="refresh-button"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
      </motion.header>

      <motion.div 
        className="dashboard-controls"
        variants={itemVariants}
      >
        <div className="filter-controls">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Users
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={filter === 'expired' ? 'active' : ''}
            onClick={() => setFilter('expired')}
          >
            Expired
          </motion.button>
        </div>

        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading && users.length === 0 ? (
          <motion.div
            key="loading"
            className="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            className="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <UserTable 
              users={filteredUsers} 
              onRefresh={fetchUsers} 
              isLoading={isLoading}
              apiUrl={apiUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Dashboard; 