import React from 'react';

const UserIcon = ({ className = "w-6 h-6", fill = "currentColor" }) => {
  return (
    <svg className={className} fill={fill} viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
};

export default UserIcon;
