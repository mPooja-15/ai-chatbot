import React from 'react';
import { UserIcon } from '../../assets/icons';

const DashboardHeader = ({ 
  title = "AI Chat System",
  user,
  onLogout,
  showUserInfo = true,
  showLogout = true,
  className = ""
}) => {
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <UserIcon className="w-6 h-6" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {showUserInfo && user && (
              <span className="text-gray-700">
                Welcome, {user.firstName || user.username || 'User'}!
              </span>
            )}
            {showLogout && (
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
