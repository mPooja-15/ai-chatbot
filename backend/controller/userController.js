const User = require('../model/User');
const Chat = require('../model/Chat');
const File = require('../model/File');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get counts
    const totalChats = await Chat.countDocuments({ userId, isActive: true });
    const totalFiles = await File.countDocuments({ userId, isActive: true });
    const totalMessages = await Chat.aggregate([
      { $match: { userId, isActive: true } },
      { $group: { _id: null, total: { $sum: '$metadata.totalMessages' } } }
    ]);

    // Get file type distribution
    const fileTypeStats = await File.aggregate([
      { $match: { userId, isActive: true } },
      { $group: { _id: '$fileType', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentChats = await Chat.find({ userId, isActive: true })
      .sort({ 'metadata.lastActivity': -1 })
      .limit(5)
      .select('title metadata.lastActivity');

    const stats = {
      totalChats,
      totalFiles,
      totalMessages: totalMessages[0]?.total || 0,
      fileTypeDistribution: fileTypeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity: recentChats
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user files
// @route   GET /api/user/files
// @access  Private
const getUserFiles = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { page = 1, limit = 10, fileType = 'all', search } = req.query;

    const query = { userId, isActive: true };
    
    if (fileType !== 'all') {
      query.fileType = fileType;
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { 'processingResult.extractedText': { $regex: search, $options: 'i' } }
      ];
    }

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        files: files.map(file => file.getFileInfo()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFiles: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user file
// @route   DELETE /api/user/files/:fileId
// @access  Private
const deleteUserFile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fileId } = req.params;
    const userId = req.user.userId;

    const file = await File.findOne({ _id: fileId, userId, isActive: true });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Soft delete file
    file.isActive = false;
    await file.save();

    // Remove file from disk
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.warn('Could not delete file from disk:', unlinkError.message);
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete user file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { theme, language } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (theme !== undefined) updateData['preferences.theme'] = theme;
    if (language !== undefined) updateData['preferences.language'] = language;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const deactivateAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason, confirmPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(confirmPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is incorrect'
      });
    }

    user.isActive = false;
    if (reason) {
      user.deactivationReason = reason;
    }
    await user.save();
    await Chat.updateMany(
      { userId },
      { isActive: false }
    );
    await File.updateMany(
      { userId },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const exportUserData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    const userId = req.user.userId;
    const { format = 'json' } = req.query;
    const user = await User.findById(userId);
    const chats = await Chat.find({ userId, isActive: true });
    const files = await File.find({ userId, isActive: true });

    const exportData = {
      user: user.getProfile(),
      chats: chats.map(chat => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        messageCount: chat.messages.length,
        settings: chat.settings
      })),
      files: files.map(file => file.getFileInfo()),
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="user_data_${Date.now()}.csv"`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user_data_${Date.now()}.json"`);
      res.json(exportData);
    }

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const convertToCSV = (data) => {
  let csv = 'Type,ID,Title,Created At,Details\n';
  
  // Add chats
  data.chats.forEach(chat => {
    csv += `Chat,${chat.id},${chat.title},${chat.createdAt},${chat.messageCount} messages\n`;
  });
  
  // Add files
  data.files.forEach(file => {
    csv += `File,${file._id},${file.originalName},${file.createdAt},${file.fileType} - ${file.sizeFormatted}\n`;
  });
  
  return csv;
};

module.exports = {
  getUserStats,
  getUserFiles,
  deleteUserFile,
  updateUserPreferences,
  deactivateAccount,
  exportUserData
};
