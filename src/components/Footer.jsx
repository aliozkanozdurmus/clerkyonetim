import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: 0.5, 
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      <motion.p
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        Ali Özkan Özdurmuş tarafından geliştirilmiştir
      </motion.p>
    </motion.footer>
  );
}

export default Footer; 