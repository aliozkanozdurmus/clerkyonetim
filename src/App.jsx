import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import ClerkProvider from './components/ClerkProvider';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // API endpoint değişkenini tanımlayalım
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Sayfayı yüklediğimizde biraz bekletelim
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="loading-screen"
      >
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </motion.div>
    );
  }

  return (
    <ClerkProvider>
      <div className="app">
        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Dashboard apiUrl={API_URL} />
          </motion.div>
        </AnimatePresence>
        
        <Footer />
      </div>
    </ClerkProvider>
  );
}

export default App; 