import React from 'react';

const ChatIcon = ({ className = "w-6 h-6", fill = "currentColor" }) => {
  return (
    <svg className={className} fill={fill} viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  );
};

export default ChatIcon;
