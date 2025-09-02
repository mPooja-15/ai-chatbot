import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'red', 
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const colorClasses = {
    red: 'border-red-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    gray: 'border-gray-500'
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]} mx-auto mb-4`}></div>
      {showText && (
        <p className="text-lg text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
