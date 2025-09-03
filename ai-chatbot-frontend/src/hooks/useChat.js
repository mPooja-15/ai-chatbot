import { useState, useRef, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useChat = (initialChatId = null) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentChatId, setChatId] = useState(initialChatId);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadExistingChat = useCallback(async (existingChatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHAT_BY_ID(existingChatId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chat = data.data.chat;
        setChatId(chat._id);
        setChatTitle(chat.title);
        setMessages(chat.messages || []);
        setUploadedFiles(chat.files || []);
        return chat;
      } else {
        throw new Error(`Failed to load chat: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading existing chat:', error);
      throw error;
    }
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'New Chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const chat = data.data.chat;
        setChatId(chat._id);
        setChatTitle(chat.title);
        return chat;
      } else {
        throw new Error(`Failed to create chat: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (message, files = []) => {
    if (!currentChatId) return;

    console.log('Sending message:', message);
    console.log('Files to send:', files);
    console.log('Current uploaded files:', uploadedFiles);

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      files
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHAT_MESSAGE(currentChatId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          files: files.map(file => ({ fileId: file._id }))
        }),
      });

      console.log('Send message response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Send message response data:', data);
        const aiMessage = {
          role: 'assistant',
          content: data.data.aiResponse.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setSelectedFiles([]);
        return aiMessage;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId]);

  const uploadFile = useCallback(async (file) => {
    if (!currentChatId) {
      console.log('No chatId available for file upload');
      return null;
    }

    setIsUploading(true);
    
    try {
      console.log('Starting file upload for:', file.name);
      console.log('Chat ID:', currentChatId);
      console.log('API endpoint:', API_ENDPOINTS.CHAT_UPLOAD(currentChatId));
      
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await fetch(API_ENDPOINTS.CHAT_UPLOAD(currentChatId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success data:', data);
        console.log('File status:', data.data.file.status);
        console.log('File processing result:', data.data.file.processingResult);
        
        const uploadedFile = data.data.file;
        setUploadedFiles(prev => [...prev, uploadedFile]);
        return uploadedFile;
      } else {
        const errorData = await response.json();
        console.log('Upload error data:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [currentChatId]);

  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const uploadedFiles = [];

    for (const file of files) {
      try {
        const uploadedFile = await uploadFile(file);
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    return uploadedFiles;
  }, [uploadFile]);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const updateChatId = useCallback((id) => {
    setChatId(id);
  }, []);

  return {
    // State
    messages,
    inputMessage,
    isLoading,
    isUploading,
    chatTitle,
    uploadedFiles,
    selectedFiles,
    currentChatId,
    
    // Refs
    messagesEndRef,
    fileInputRef,
    
    // Actions
    setInputMessage,
    setSelectedFiles,
    setChatTitle,
    setUploadedFiles,
    setMessages,
    setIsUploading,
    
    // Functions
    scrollToBottom,
    loadExistingChat,
    createNewChat,
    sendMessage,
    uploadFile,
    handleFileUpload,
    addMessage,
    clearSelectedFiles,
    updateChatId
  };
};
