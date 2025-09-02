import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { API_ENDPOINTS } from '../config/api';
import ChatHeader from './common/ChatHeader';
import MessageList from './common/MessageList';
import ChatInput from './common/ChatInput';
import FileList from './common/FileList';
import LoadingSpinner from './common/LoadingSpinner';
import { createErrorMessage, createNetworkErrorMessage } from '../utils/chatUtils';

const ChatHistory = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const {
    messages,
    inputMessage,
    isLoading,
    uploadedFiles,
    selectedFiles,
    messagesEndRef,
    fileInputRef,
    setInputMessage,
    setSelectedFiles,
    setMessages,
    setUploadedFiles,
    sendMessage,
    uploadFile
  } = useChat(chatId);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHAT_BY_ID(chatId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chatData = data.data.chat;
        setChat(chatData);
        setMessages(chatData.messages || []);
        setUploadedFiles(chatData.files || []);
      } else {
        console.error('Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessage(inputMessage, selectedFiles);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = createErrorMessage(error.message || 'Failed to send message');
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleFileUploadEvent = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    for (const file of files) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        const errorMessage = createErrorMessage(`Failed to upload ${file.name}: ${error.message}`);
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading chat history..." />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat Not Found</h2>
          <p className="text-gray-600 mb-6">The chat you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader 
        subtitle={chat.title}
        onLogout={handleLogout}
      />

      <MessageList 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        showEmptyState={messages.length === 0}
        emptyStateMessage="No Messages Yet"
        emptyStateDescription="Start the conversation by sending a message!"
      />

      <FileList files={uploadedFiles} />

      <ChatInput
        inputMessage={inputMessage}
        onInputChange={(e) => setInputMessage(e.target.value)}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUploadEvent}
        fileInputRef={fileInputRef}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatHistory;
