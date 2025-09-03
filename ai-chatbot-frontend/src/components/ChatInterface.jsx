import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { 
    ChatHeader, 
    MessageList, 
    ChatInput, 
    FileList, 
    LoadingSpinner 
} from './common';
import { 
    isAskingAboutFiles as checkIfAskingAboutFiles,
    createWelcomeMessage,
    createFileUploadSuccessMessage,
    createFileUploadErrorMessage,
    createFileSuggestionMessage,
    createReminderMessage
} from '../utils/chatUtils';

const ChatInterface = () => {
    const navigate = useNavigate();
    const { chatId: urlChatId } = useParams();
    const {
        messages,
        inputMessage,
        isLoading,
        isUploading,
        chatTitle,
        uploadedFiles,
        selectedFiles,
        currentChatId: chatId,
        messagesEndRef,
        fileInputRef,
        setInputMessage,
        setSelectedFiles,
        sendMessage,
        uploadFile,
        setMessages,
        loadExistingChat,
        createNewChat
    } = useChat();

    useEffect(() => {
        const initializeChat = async () => {
            try {
                if (urlChatId) {
                    await loadExistingChat(urlChatId);
                } else {
                    await createNewChat();
                }
                if (messages.length === 0) {
                    setMessages([createWelcomeMessage()]);
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        initializeChat();
    }, [urlChatId, loadExistingChat, createNewChat, messages.length, setMessages]);

    useEffect(() => {
        console.log('ChatInterface - chatId changed:', chatId);
        console.log('ChatInterface - urlChatId:', urlChatId);
    }, [chatId, urlChatId]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Check if user is asking about uploaded files
        const isAskingAboutFiles = uploadedFiles.length > 0 && 
            checkIfAskingAboutFiles(inputMessage, uploadedFiles.length > 0);

        console.log('Sending message:', inputMessage);
        console.log('Uploaded files:', uploadedFiles);
        console.log('Is asking about files:', isAskingAboutFiles);

        try {
            let filesToSend = [];
            if (isAskingAboutFiles) {
                filesToSend = uploadedFiles
                    .filter(file => file.status === 'processed')
                    .map(file => ({ fileId: file._id }));
            } else {
                filesToSend = selectedFiles.map(file => ({ fileId: file._id }));
            }

            await sendMessage(inputMessage, filesToSend);

            // If this was a file-based question and files were included, show a reminder
            if (isAskingAboutFiles && filesToSend.length > 0) {
                setTimeout(() => {
                    setMessages(prev => [...prev, createReminderMessage()]);
                }, 2000);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUploadEvent = async (event) => {
        const files = Array.from(event.target.files);
        console.log('File upload event triggered with files:', files);
        console.log('Current chatId:', chatId);
        if (!files.length || !chatId) {
            console.log('File upload blocked - no files or no chatId');
            return;
        }

        for (const file of files) {
            try {
                const uploadedFile = await uploadFile(file);
                if (uploadedFile) {
                    // Show success message
                    setMessages(prev => [...prev, createFileUploadSuccessMessage(file.name)]);

                    // Add helpful suggestion after file upload
                    setTimeout(() => {
                        setMessages(prev => [...prev, createFileSuggestionMessage()]);
                    }, 1000);
                }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                setMessages(prev => [...prev, createFileUploadErrorMessage(file.name, error.message)]);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!chatId && isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Initializing chat..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ChatHeader 
                subtitle={
                    chatId && messages.length > 0
                        ? `Continue Chat - ${messages.length} messages`
                        : chatTitle
                }
                onLogout={handleLogout}
            />

            <MessageList 
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                showEmptyState={messages.length === 0 && !isLoading && !chatId}
                emptyStateMessage="Start a Conversation"
                emptyStateDescription="Ask me anything! I can help with questions, analyze files, and more."
            />

            <FileList files={uploadedFiles} />

            <ChatInput
                inputMessage={inputMessage}
                onInputChange={(e) => setInputMessage(e.target.value)}
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUploadEvent}
                fileInputRef={fileInputRef}
                isLoading={isLoading}
                isUploading={isUploading}
            />
        </div>
    );
};

export default ChatInterface;
