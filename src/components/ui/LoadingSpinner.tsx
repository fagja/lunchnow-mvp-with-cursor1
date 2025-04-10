import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-12 w-12 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
  );
};

export default LoadingSpinner;
