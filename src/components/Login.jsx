import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Login.css';

const Login = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Update error message if provided from parent
  useEffect(() => {
    if (error) {
      setFormError(error);
      setIsLoading(false);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      await onLogin(username, password);
    } catch (error) {
      console.error('Login submission error:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Input focus animasyonu için güvenli değerler
  const inputVariants = {
    focused: { 
      scale: 1.02, 
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)"
    },
    unfocused: { 
      scale: 1, 
      boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)" 
    }
  };
  
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.98 },
    disabled: { opacity: 0.7 }
  };

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Admin Login
        </motion.h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <motion.input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variants={inputVariants}
              whileFocus="focused"
              initial="unfocused"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <motion.input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variants={inputVariants}
              whileFocus="focused"
              initial="unfocused"
              required
              disabled={isLoading}
            />
          </div>
          
          {formError && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formError}
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            className="login-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isLoading}
            animate={isLoading ? "disabled" : ""}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Login; 