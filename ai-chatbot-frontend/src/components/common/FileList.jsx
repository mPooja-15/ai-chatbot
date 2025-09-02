import React from 'react';

const FileList = ({ 
  files, 
  showStatus = true, 
  showDescription = true,
  className = "px-4 py-2 bg-red-50 border-t border-red-200"
}) => {
  if (!files || files.length === 0) return null;

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'processed':
        return { text: '✅ Ready', bgColor: 'bg-green-100 border-green-300 text-green-800' };
      case 'processing':
        return { text: '⏳ Processing', bgColor: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
      case 'error':
        return { text: '❌ Error', bgColor: 'bg-red-100 border-red-300 text-red-800' };
      default:
        return { text: '📤 Uploaded', bgColor: 'bg-white border-red-200 text-red-700' };
    }
  };

  const hasProcessedFiles = files.some(f => f.status === 'processed');

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-sm font-medium text-red-800">Files in this chat:</span>
        {files.map((file, index) => {
          const statusDisplay = getStatusDisplay(file.status);
          
          return (
            <div
              key={index}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${statusDisplay.bgColor}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span>{file.originalName}</span>
              {showStatus && (
                <span className="text-xs">
                  {statusDisplay.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {showDescription && hasProcessedFiles && (
        <div className="mt-2 text-xs text-red-700">
          💡 You can now ask questions about these files! The AI will search through the PDF content first.
        </div>
      )}
    </div>
  );
};

export default FileList;
