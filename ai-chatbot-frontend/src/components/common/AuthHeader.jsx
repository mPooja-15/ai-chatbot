import React from 'react';

const AuthHeader = ({ 
  icon, 
  title, 
  subtitle, 
  iconBgColor = "bg-red-500",
  iconColor = "text-white"
}) => {
  return (
    <div className="text-center mb-8">
      <div className={`mx-auto w-20 h-20 ${iconBgColor} rounded-full flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

export default AuthHeader;
