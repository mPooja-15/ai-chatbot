const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'csv', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  processingResult: {
    extractedText: String,
    error: String,
    processedAt: Date
  },
  metadata: {
    pages: Number,
    columns: [String], 
    rows: Number,
    encoding: String,
    language: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

fileSchema.index({ userId: 1, chatId: 1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ createdAt: -1 });

fileSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

fileSchema.methods.markAsProcessed = function(extractedText, metadata = {}) {
  this.status = 'processed';
  this.processingResult = {
    extractedText,
    processedAt: new Date()
  };
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

fileSchema.methods.markAsError = function(error) {
  this.status = 'error';
  this.processingResult = {
    error,
    processedAt: new Date()
  };
  return this.save();
};


fileSchema.methods.getFileInfo = function() {
  const fileObject = this.toObject();
  delete fileObject.path;
  return fileObject;
};

fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
