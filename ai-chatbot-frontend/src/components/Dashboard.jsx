import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../config/api';
import { 
  DashboardHeader, 
  ChatCard, 
  Pagination, 
  SearchInput, 
  LoadingSpinner 
} from './common';
import { UserIcon, ChatIcon, ArrowRightIcon, PlusIcon } from '../assets/icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const itemsPerPage = 5;

  const fetchUserChats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHATS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.data.chats || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserChats();
  }, [fetchUserChats]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleStartChatting = useCallback(() => {
    if (chats.length > 0) {
      const mostRecentChat = chats[0];
      navigate(`/chat/${mostRecentChat._id}`);
    } else {
      navigate('/chat');
    }
  }, [chats, navigate]);

  const handleChatClick = useCallback((chatId) => {
    navigate(`/chat/${chatId}`);
  }, [navigate]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleRetry = useCallback(() => {
    fetchUserChats();
  }, [fetchUserChats]);

  // Filter and paginate chats
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChats = filteredChats.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You have successfully logged in to the AI Chat System.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            <div
              className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-500 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              onClick={handleStartChatting}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatIcon className="w-8 h-8" fill="#dc2626" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue Chatting</h3>
              <p className="text-gray-600">Continue your conversation with AI</p>
              <div className="mt-3 text-sm text-red-500 font-medium">Click to continue →</div>
            </div>

            <div
              className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-500 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              onClick={() => navigate('/chat')}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8" fill="#dc2626" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New Chat</h3>
              <p className="text-gray-600">Start a fresh conversation</p>
              <div className="mt-3 text-sm text-red-500 font-medium">Click to start →</div>
            </div>
          </div>

          {/* Chat History Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Chat History</h3>
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearch}
                  onClear={handleSearchClear}
                  placeholder="Search chats..."
                  className="w-64"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Chat List */}
              {currentChats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatIcon className="w-8 h-8" fill="#9ca3af" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No chats found' : 'No chats yet'}
                  </h4>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Start your first conversation to see it here!'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentChats.map((chat) => (
                    <ChatCard
                      key={chat._id}
                      chat={chat}
                      onClick={handleChatClick}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredChats.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-6"
                />
              )}

              {/* Results Info */}
              {filteredChats.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredChats.length)} of {filteredChats.length} chats
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
