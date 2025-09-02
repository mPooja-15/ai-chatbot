import React from 'react';

const ChatInput = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  onFileUpload,
  fileInputRef,
  isLoading = false,
  placeholder = "Type your message here... (Press Enter to send, Shift+Enter for new line)",
  showFileUpload = true,
  fileTypes = ".pdf,.csv",
  fileDescription = "Supports PDF and CSV files"
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Monitor fileInputRef changes
  React.useEffect(() => {
    console.log('onFileUpload type:', typeof onFileUpload);
  }, [fileInputRef, onFileUpload]);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            {showFileUpload && (
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => {       
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    } else {
                      alert('File input not available. Please refresh the page.');
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Upload files"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={fileTypes}
                  onChange={(e) => {
                    
                    if (e && e.target && e.target.files) {                  
                      try {
                        onFileUpload(e);
                      } catch (error) {
                        console.error('Error calling onFileUpload:', error);
                      }
                    } else {
                      console.error('Event target files:', e?.target?.files);
                    }
                  }}
                  className="hidden"
                />
                <span className="text-xs text-gray-500">
                  {fileDescription}
                </span>
              </div>
            )}
            
            <textarea
              value={inputMessage}
              onChange={onInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="3"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
