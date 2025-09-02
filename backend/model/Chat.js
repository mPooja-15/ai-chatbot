const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    fileType: {
      type: String,
      enum: ['pdf', 'csv', 'other']
    }
  }]
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    fileContext: {
      hasFiles: {
        type: Boolean,
        default: false
      },
      fileTypes: [String],
      totalFiles: {
        type: Number,
        default: 0
      }
    }
  },
  settings: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 1000
    }
  }
}, {
  timestamps: true
});

chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isActive: 1 });
chatSchema.index({ 'metadata.lastActivity': -1 });

chatSchema.virtual('messageCount').get(function() {
  if (this.messages === undefined) {
    return this.metadata?.totalMessages || 0;
  }
  return this.messages.length || 0;
});

chatSchema.methods.addMessage = function(role, content, attachments = []) {
  const message = {
    role,
    content,
    timestamp: new Date(),
    attachments
  };
  
  this.messages.push(message);
  this.metadata.totalMessages = this.messages.length;
  this.metadata.lastActivity = new Date();
  
  if (attachments && attachments.length > 0) {
    this.metadata.fileContext.hasFiles = true;
    this.metadata.fileContext.totalFiles += attachments.length;
    
    attachments.forEach(attachment => {
      if (attachment.fileType && !this.metadata.fileContext.fileTypes.includes(attachment.fileType)) {
        this.metadata.fileContext.fileTypes.push(attachment.fileType);
      }
    });
  }
  
  return this.save();
};

chatSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

chatSchema.methods.getLastMessagePreview = function() {
  if (!this.messages || this.messages.length === 0) {
    return null;
  }
  const lastMessage = this.messages[this.messages.length - 1];
  return {
    role: lastMessage.role,
    content: lastMessage.content.length > 100 ? 
      lastMessage.content.substring(0, 100) + '...' : 
      lastMessage.content,
    timestamp: lastMessage.timestamp
  };
};

chatSchema.methods.clearMessages = function() {
  this.messages = [];
  this.metadata.totalMessages = 0;
  this.metadata.fileContext = {
    hasFiles: false,
    fileTypes: [],
    totalFiles: 0
  };
  return this.save();
};

chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema);
