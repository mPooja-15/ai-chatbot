import React from 'react';
import { ChatIcon, ArrowRightIcon } from '../../assets/icons';

const ChatCard = ({ 
  chat, 
  onClick, 
  isSelected = false,
  showMessageCount = true,
  showDate = true,
  className = ""
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChatTitle = (chat) => {
    if (chat.title === 'New Chat') {
      return `Chat ${formatTime(chat.createdAt)}`;
    }
    return chat.title;
  };

  return (
    <div
      onClick={() => onClick(chat._id)}
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-red-300 cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'
      } ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <ChatIcon className="w-5 h-5" fill="#dc2626" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {getChatTitle(chat)}
          </h4>
          {showDate && (
            <p className="text-sm text-gray-500">
              {formatDate(chat.metadata?.lastActivity || chat.createdAt)}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showMessageCount && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            {chat.metadata?.totalMessages || 0} messages
          </span>
        )}
        <ArrowRightIcon className="w-5 h-5" fill="#9ca3af" />
      </div>
    </div>
  );
};

export default ChatCard;
