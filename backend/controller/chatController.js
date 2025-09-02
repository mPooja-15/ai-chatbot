const Chat = require('../model/Chat');
const File = require('../model/File');
const { processFile } = require('../utils/fileProcessor');
const { validationResult } = require('express-validator');
const OpenAI = require('openai');


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title } = req.body;
    const userId = req.user.userId;

    const chat = new Chat({
      userId,
      title: title || 'New Chat'
    });

    await chat.save();

    const User = require('../model/User');
    const user = await User.findById(userId);

    let userName = 'there';
    if (user) {
      if (user.firstName && user.lastName) {
        userName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        userName = user.firstName;
      } else if (user.username) {
        userName = user.username;
      } else if (user.email) {
        userName = user.email.split('@')[0];
      }
    }

    const welcomeMessage = `Hello ${userName}! 👋 I'm your AI assistant. How can I help you today? You can ask me questions, upload files (PDF/CSV) for analysis, or just chat with me!`;
    await chat.addMessage('assistant', welcomeMessage);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const query = { userId, isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    const chats = await Chat.find(query)
      .sort({ 'metadata.lastActivity': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-messages')
      .lean();

    const total = await Chat.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const File = require('../model/File');
    const files = await File.find({
      chatId: chatId,
      userId: userId,
      status: 'processed'
    }).sort({ createdAt: 1 });
    const chatData = {
      _id: chat._id,
      title: chat.title,
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      metadata: chat.metadata,
      settings: chat.settings,
      messages: chat.messages || [],
      files: files.map(file => ({
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        fileType: file.fileType,
        size: file.size,
        status: file.status,
        createdAt: file.createdAt,
        processingResult: file.processingResult
      }))
    };

    res.status(200).json({
      success: true,
      data: { chat: chatData }
    });

  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { message, files } = req.body;
    const userId = req.user.userId;
    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const nameQuestionPatterns = [
      /what\s+is\s+my\s+name\??/i,
      /what's\s+my\s+name\??/i,
      /who\s+am\s+i\??/i,
      /tell\s+me\s+my\s+name/i,
      /my\s+name\s+is\s+what\??/i,
      /what\s+do\s+you\s+call\s+me\??/i
    ];

    const profileQuestionPatterns = [
      /show\s+my\s+profile/i,
      /my\s+profile/i,
      /tell\s+me\s+about\s+myself/i,
      /what\s+do\s+you\s+know\s+about\s+me/i
    ];

    const helpPatterns = [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /commands/i,
      /features/i,
      /show\s+help/i
    ];

    const chatInfoPatterns = [
      /chat\s+info/i,
      /session\s+info/i,
      /current\s+chat/i,
      /what\s+chat\s+is\s+this/i
    ];

    const isAskingForName = nameQuestionPatterns.some(pattern => pattern.test(message));
    const isAskingForProfile = profileQuestionPatterns.some(pattern => pattern.test(message));
    const isAskingForHelp = helpPatterns.some(pattern => pattern.test(message));
    const isAskingForChatInfo = chatInfoPatterns.some(pattern => pattern.test(message));

    if (isAskingForName) {
      // Get user information from the database
      const User = require('../model/User');
      const user = await User.findById(userId);

      let userName = 'User';
      if (user) {
        if (user.firstName && user.lastName) {
          userName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
          userName = user.firstName;
        } else if (user.username) {
          userName = user.username;
        } else if (user.email) {
          userName = user.email.split('@')[0];
        }
      }

      const aiResponse = `Your name is ${userName}! 😊`;
      await chat.addMessage('assistant', aiResponse);

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage: { role: 'user', content: message, timestamp: new Date() },
          aiResponse: { role: 'assistant', content: aiResponse, timestamp: new Date() }
        }
      });
    }

    if (isAskingForProfile) {
      const User = require('../model/User');
      const user = await User.findById(userId);

      let profileInfo = 'User Profile:\n';
      if (user) {
        if (user.firstName && user.lastName) {
          profileInfo += `👤 **Name:** ${user.firstName} ${user.lastName}\n`;
        } else if (user.firstName) {
          profileInfo += `👤 **Name:** ${user.firstName}\n`;
        }
        if (user.username) {
          profileInfo += `🏷️ **Username:** ${user.username}\n`;
        }
        if (user.email) {
          profileInfo += `📧 **Email:** ${user.email}\n`;
        }
        if (user.createdAt) {
          profileInfo += `📅 **Member since:** ${new Date(user.createdAt).toLocaleDateString()}\n`;
        }
        if (user.lastLogin) {
          profileInfo += `🕒 **Last login:** ${new Date(user.lastLogin).toLocaleString()}\n`;
        }
      }

      const aiResponse = profileInfo;
      await chat.addMessage('assistant', aiResponse);

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage: { role: 'user', content: message, timestamp: new Date() },
          aiResponse: { role: 'assistant', content: aiResponse, timestamp: new Date() }
        }
      });
    }

    if (isAskingForHelp) {
      const helpMessage = `🤖 **AI Chat System - Help & Commands**

**Basic Commands:**
• Ask "What is my name?" - I'll tell you your name
• Ask "Show my profile" - I'll show your profile information
• Type "help" - Show this help message
• Ask "Chat info" - Show current chat session info

**Chat Features:**
• Ask me anything - I'm here to help with questions
• Upload files (PDF/CSV) - I can analyze and answer questions about them
• I remember our conversation context
• I know your name and can personalize responses

**File Support:**
• PDF files - I can read and analyze text content
• CSV files - I can process data and answer questions
• Maximum file size: 10MB
• Supported formats: .pdf, .csv

**Examples:**
• "What is my name?"
• "Show my profile"
• "Chat info"
• "Help me analyze this PDF"
• "What can you do?"
• "Tell me about myself"

Feel free to ask me anything or upload files for analysis! 🚀`;

      const aiResponse = helpMessage;
      await chat.addMessage('assistant', aiResponse);

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage: { role: 'user', content: message, timestamp: new Date() },
          aiResponse: { role: 'assistant', content: aiResponse, timestamp: new Date() }
        }
      });
    }

    if (isAskingForChatInfo) {
      const chatInfoMessage = `💬 **Current Chat Session**

**Chat Details:**
• **Title:** ${chat.title}
• **Created:** ${new Date(chat.createdAt).toLocaleString()}
• **Last Activity:** ${new Date(chat.metadata.lastActivity).toLocaleString()}
• **Total Messages:** ${chat.messages.length}
• **Files Uploaded:** ${chat.files ? chat.files.length : 0}

**Your Information:**
• **User ID:** ${userId}
• **Session Started:** ${new Date().toLocaleString()}

This is a new conversation where I can help you with questions, file analysis, and more! 🚀`;

      const aiResponse = chatInfoMessage;
      await chat.addMessage('assistant', aiResponse);

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage: { role: 'user', content: message, timestamp: new Date() },
          aiResponse: { role: 'assistant', content: aiResponse, timestamp: new Date() }
        }
      });
    }

    await chat.addMessage('user', message, files || []);
    let fileDocs = [];
    if (files && files.length > 0) {
      fileDocs = await File.find({
        _id: { $in: files.map(f => f.fileId) },
        chatId,
        status: 'processed'
      });
    } else {

      fileDocs = await File.find({
        chatId,
        status: 'processed'
      });
    }

    let context = '';
    let fileContext = '';

    if (fileDocs.length > 0) {
      fileContext = fileDocs.map(f =>
        `File: ${f.originalName}\nContent: ${f.processingResult.extractedText}`
      ).join('\n\n');

      context = `\n\nIMPORTANT: You have access to the following file content. ALWAYS prioritize answering from this content first:\n${fileContext}`;
    }

    const recentMessages = chat.getRecentMessages(10);
    const messagesForAI = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get user information for context
    const User = require('../model/User');
    const user = await User.findById(userId);
    let userName = 'User';
    if (user) {
      if (user.firstName && user.lastName) {
        userName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        userName = user.firstName;
      } else if (user.username) {
        userName = user.username;
      } else if (user.email) {
        userName = user.email.split('@')[0];
      }
    }

    // Create enhanced system message that prioritizes PDF content
    let systemMessage = `You are a helpful AI assistant. The user you are talking to is ${userName}.`;

    if (context) {
      systemMessage += `\n\nCRITICAL INSTRUCTIONS FOR FILE-BASED QUESTIONS:
1. ALWAYS search the provided file content FIRST for answers
2. If the answer is found in the file, provide it with a reference like "According to the PDF..."
3. If the answer is NOT found in the file, clearly state "This information is not found in the uploaded PDF" before giving a general answer
4. When referencing file content, quote the relevant parts
5. Be specific about what information comes from the file vs. general knowledge

File content available: ${fileContext}`;
    } else {
      systemMessage += `\n\nNote: No files are currently uploaded in this chat.`;
    }

    messagesForAI.unshift({
      role: 'system',
      content: systemMessage
    });

    try {
      const completion = await openai.chat.completions.create({
        model: chat.settings.model,
        messages: messagesForAI,
        temperature: chat.settings.temperature,
        max_tokens: chat.settings.maxTokens
      });

      const aiResponse = completion.choices[0].message.content;
      await chat.addMessage('assistant', aiResponse);

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage: { role: 'user', content: message, timestamp: new Date() },
          aiResponse: { role: 'assistant', content: aiResponse, timestamp: new Date() }
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      await chat.addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
      res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable',
        error: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    console.log('File upload request:', { chatId, userId, file: req.file?.originalname });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    let fileType = 'other';
    if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else if (req.file.mimetype === 'text/csv') fileType = 'csv';
    
    console.log('File type detected:', fileType);
    
    const file = new File({
      userId,
      chatId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      fileType
    });

    await file.save();
    console.log('File saved to database with ID:', file._id);
    
    // Process the file and wait for completion
    try {
      console.log('Starting file processing...');
      const result = await processFile(file._id, req.file.path, fileType);
      console.log('File processing result:', result);
      
      if (result.success) {
        await file.markAsProcessed(result.extractedText, result.metadata);
        console.log(`File ${file.originalName} processed successfully`);
        console.log('Extracted text length:', result.extractedText?.length || 0);
      } else {
        await file.markAsError(result.error);
        console.error(`File ${file.originalName} processing failed:`, result.error);
      }
    } catch (error) {
      console.error('File processing error:', error);
      await file.markAsError('File processing failed');
    }

    // Fetch the updated file to get the current status
    const updatedFile = await File.findById(file._id);
    console.log('Updated file status:', updatedFile.status);

    res.status(200).json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        file: updatedFile.getFileInfo(),
        message: updatedFile.status === 'processed' 
          ? 'File processed successfully! You can now ask questions about it.'
          : 'File uploaded but processing failed. Please try again.'
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateChatSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { model, temperature, maxTokens } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (model !== undefined) updateData['settings.model'] = model;
    if (temperature !== undefined) updateData['settings.temperature'] = temperature;
    if (maxTokens !== undefined) updateData['settings.maxTokens'] = maxTokens;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat settings updated successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const messages = chat.messages || [];
    const totalMessages = messages.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = messages.slice(startIndex, endIndex);


    const File = require('../model/File');
    const files = await File.find({
      chatId: chatId,
      userId: userId,
      status: 'processed'
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        title: chat.title,
        messages: paginatedMessages,
        files: files.map(file => ({
          _id: file._id,
          originalName: file.originalName,
          filename: file.filename,
          fileType: file.fileType,
          size: file.size,
          status: file.status,
          createdAt: file.createdAt,
          processingResult: file.processingResult
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages: totalMessages,
          hasNext: endIndex < totalMessages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createChat,
  getUserChats,
  getChatById,
  getChatHistory,
  sendMessage,
  uploadFile,
  updateChatSettings,
  deleteChat
};
