import React from 'react';

const PlusIcon = ({ className = "w-6 h-6", fill = "currentColor" }) => {
  return (
    <svg className={className} fill={fill} viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );
};

export default PlusIcon;
