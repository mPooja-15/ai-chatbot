// Utility functions for chat operations

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isAskingAboutFiles = (message, hasFiles) => {
  if (!hasFiles) return false;
  
  const fileKeywords = [
    'pdf', 'file', 'document', 'what', 'how', 'explain', 'summarize',
    'find', 'search', 'tell me', 'show me', 'give me', 'describe',
    'analyze', 'review', 'extract', 'read', 'content', 'information',
    'data', 'details'
  ];
  
  const lowerMessage = message.toLowerCase();
  return fileKeywords.some(keyword => lowerMessage.includes(keyword));
};

export const createWelcomeMessage = () => ({
  role: 'assistant',
  content: `Hello! 👋 I'm your AI assistant. How can I help you today? You can ask me questions, upload files (PDF/CSV) for analysis, or just chat with me!`,
  timestamp: new Date()
});

export const createFileUploadSuccessMessage = (fileName) => ({
  role: 'assistant',
  content: `✅ File "${fileName}" uploaded successfully! I'm now processing it. You can ask me questions about this file once processing is complete.`,
  timestamp: new Date()
});

export const createFileUploadErrorMessage = (fileName, error) => ({
  role: 'assistant',
  content: `❌ Failed to upload "${fileName}": ${error}`,
  timestamp: new Date(),
  isError: true
});

export const createFileSuggestionMessage = () => ({
  role: 'assistant',
  content: `💡 **How to ask questions about your PDF:**

Once the file is processed (status shows "✅ Ready"), you can ask questions like:
• "What is this PDF about?"
• "Summarize the main points"
• "Find information about [specific topic]"
• "What are the key findings?"

I'll search through the PDF content first and give you answers based on what's actually in the document!`,
  timestamp: new Date()
});

export const createReminderMessage = () => ({
  role: 'assistant',
  content: `💡 **Reminder:** I've searched through your uploaded PDF(s) to answer your question. If you need more specific information, try asking more detailed questions like:
• "Find the section about [specific topic]"
• "What does the PDF say about [specific question]?"
• "Extract all the data about [specific subject]"
• "Summarize the key points from [specific section]"`,
  timestamp: new Date()
});

export const createErrorMessage = (message) => ({
  role: 'assistant',
  content: `Error: ${message}`,
  timestamp: new Date(),
  isError: true
});

export const createNetworkErrorMessage = () => ({
  role: 'assistant',
  content: 'Network error. Please check your connection and try again.',
  timestamp: new Date(),
  isError: true
});

export const getFileStatusColor = (status) => {
  switch (status) {
    case 'processed':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'processing':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'error':
      return 'bg-red-100 border-red-300 text-red-800';
    default:
      return 'bg-white border-red-200 text-red-700';
  }
};

export const getFileStatusText = (status) => {
  switch (status) {
    case 'processed':
      return '✅ Ready';
    case 'processing':
      return '⏳ Processing';
    case 'error':
      return '❌ Error';
    default:
      return '📤 Uploaded';
  }
};

export const validateFileType = (file, allowedTypes = ['.pdf', '.csv']) => {
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
