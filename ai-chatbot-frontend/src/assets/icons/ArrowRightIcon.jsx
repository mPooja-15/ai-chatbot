import React from 'react';

const ArrowRightIcon = ({ className = "w-5 h-5", fill = "currentColor" }) => {
  return (
    <svg className={className} fill="none" stroke={fill} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
};

export default ArrowRightIcon;
