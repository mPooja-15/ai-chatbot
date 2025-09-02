
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  CHATS: `${API_BASE_URL}/api/chat`,
  CHAT_BY_ID: (chatId) => `${API_BASE_URL}/api/chat/${chatId}`,
  CHAT_MESSAGE: (chatId) => `${API_BASE_URL}/api/chat/${chatId}/message`,
  CHAT_UPLOAD: (chatId) => `${API_BASE_URL}/api/chat/${chatId}/upload`,
  CHAT_HISTORY: (chatId) => `${API_BASE_URL}/api/chat/${chatId}/history`,
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  TEST_CORS: `${API_BASE_URL}/api/test-cors`
};
