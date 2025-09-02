import React from 'react';
import { SearchIcon, CloseIcon } from '../../assets/icons';

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
  disabled = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5" fill="#9ca3af" />
      </div>
      
      {/* Clear Button */}
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <CloseIcon className="w-5 h-5" fill="currentColor" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
