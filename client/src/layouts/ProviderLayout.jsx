import React from 'react';
import ProviderSidebar from '../components/ProviderSidebar';

const ProviderLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      <ProviderSidebar />
      <div className="flex-1 ml-64 bg-gray-50">
        <div className="min-h-screen p-6">{children}</div>
      </div>
    </div>
  );
};

export default ProviderLayout;
