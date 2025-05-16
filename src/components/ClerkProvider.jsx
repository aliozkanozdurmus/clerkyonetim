import React from 'react';

const ClerkProvider = ({ children }) => {
  // Clerk yapılandırması olmadan doğrudan içeriği göster
  return (
    <div className="clerk-provider-wrapper">
      {children}
    </div>
  );
};

export default ClerkProvider; 